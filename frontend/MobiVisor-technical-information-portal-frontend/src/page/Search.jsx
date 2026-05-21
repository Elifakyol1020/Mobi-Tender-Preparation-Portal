import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../css/Search.css';
import logo from "../image/logo.png";
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from "../config/env";
import { searchTranslations } from "../constants/i18n";
import { FaPen, FaPlus, FaSignOutAlt, FaUserShield } from "react-icons/fa";

function Search() {



    const categoryOptions = [
        { value: "1", label: "General" },
        { value: "2", label: "Security" },
        { value: "3", label: "Management" },
        { value: "4", label: "Use" },
        { value: "5", label: "Reporting" },
    ];

    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [lang, setLang] = useState('EN');

    const [editFields, setEditFields] = useState({
        categoryId: '',
        categoryName: '',
        article: '',
        suitability: '',
        mobiComment: '',
        specificationId: '',
        specificationName: ''
    });


    const role = localStorage.getItem("role");
    console.log("Current role:", role);

    const textareaRef = useRef();

    const navigate = useNavigate();
    const handleLogout = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/");
            return;
        }
        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/auth/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            console.warn("Logout isteği başarısız:", error.response?.data || error.message);
        }
        localStorage.removeItem("accessToken");
        navigate("/");
    };


    // SEÇİLENLER için state:
    const [selectedRows, setSelectedRows] = useState([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Otomatik büyüyen textarea fonksiyonu
    const handleKeywordChange = (e) => {
        setKeyword(e.target.value);
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
        }
    };

    const handleClick = async () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.get(`${API_BASE_URL}/api/v1/search/advanced`, {
                params: { keyword },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setResults(response.data);
        } catch (error) {
            setResults([]);
        }
    };

    const getSuitabilityStyle = (suitability) => {
        if (!suitability) return {};
        if (suitability.toLowerCase().includes("uygun değil")) {
            return { backgroundColor: '#ef9a9a' };
        } else if (suitability.toLowerCase().includes("kısmen uygun")) {
            return { backgroundColor: '#fff59d' };
        } else if (suitability.toLowerCase().includes("uygun")) {
            return { backgroundColor: 'lightgreen' };
        }
        return {};
    };

    const handleEdit = (id) => {
        const item = results.find(i => i.id === id);
        setEditingItem(item);
        setEditFields({
            categoryId: item.categoryId || '',
            categoryName: item.categoryName || '',
            article: item.article || '',
            suitability: item.suitability || '',
            mobiComment: item.mobiComment || '',
            specificationId: item.specificationId || '',
            specificationName: item.specificationName || ''
        });
        setShowEditModal(true);
    };

    // ARTİ BUTONU 
    const handleAdd = (id) => {
        const selected = results.find(item => item.id === id);
        setSelectedRows((prev) => {
            if (prev.some(row => row.id === id)) return prev;
            return [...prev, selected];
        });
    };

    // SAĞ ÜST ÖNİZLEME KAPAT
    const handleRemoveSelected = (id) => {
        setSelectedRows((prev) => prev.filter(row => row.id !== id));
    };

    // DÜZENLEME
    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        if (name === "categoryId") {
            const selected = categoryOptions.find(opt => opt.value === value);
            setEditFields(fields => ({
                ...fields,
                categoryId: value,
                categoryName: selected ? selected.label : ""
            }));
        } else {
            setEditFields(fields => ({
                ...fields,
                [name]: value
            }));
        }
    };


    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const payload = {
                article: editFields.article,
                suitability: editFields.suitability,
                mobiComment: editFields.mobiComment,
                specificationId: editFields.specificationId ? Number(editFields.specificationId) : null,
                categoryId: editFields.categoryId ? Number(editFields.categoryId) : null
            };
            await axios.put(
                `${API_BASE_URL}/api/v1/specification-items/${editingItem.id}`,
                payload,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            setResults((prevResults) =>
                prevResults.map((item) =>
                    item.id === editingItem.id
                        ? { ...item, ...editFields }
                        : item
                )
            );
            setShowEditModal(false);
        } catch (error) {
            alert('Düzenleme hatası: ' + (error.response?.data || error.message));
        }
    };


    // SADECE İNDİR 
    const handleDownloadOnly = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const payload = {
                selectedIds: selectedRows.map(row => row.id),
                newSpecificationName: editFields.specificationName || ""
            };


            const response = await axios.post(
                `${API_BASE_URL}/api/v1/specification-items/export-selected`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'blob'
                }
            );


            let filename = "export.xlsx";
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.indexOf('filename=') !== -1) {
                filename = disposition.split('filename=')[1].replace(/["']/g, '');
            } else if (editFields.specificationName) {
                filename = editFields.specificationName.replace(/[^\w\d]/g, "_") + ".xlsx";
            }


            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert("İndirme tamamlandı!");
        } catch (err) {
            console.error("İndirme Hatası:", err);
            alert('İndirme hatası: ' + (err.response?.data || err.message));
        }
    };



    // SADECE KAYDET 
    const handleExportAndUpload = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const payload = {
                selectedIds: selectedRows.map(row => row.id),
                newSpecificationName: editFields.specificationName
            };
            await axios.post(
                `${API_BASE_URL}/api/v1/specification-items/duplicate-and-export`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            alert("Başarıyla kaydedildi!");
            setShowPreviewModal(false);
        } catch (err) {
            alert('Kayıt hatası: ' + (err.response?.data || err.message));
        }
    };



    // İlk render'da ve keyword değiştiğinde textarea boyunu ayarla
    React.useEffect(() => {
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
        }
    }, [keyword]);

    // Dili seçili olan objeden al
    const t = searchTranslations[lang];

    const handleCloseModal = () => {
        setShowPreviewModal(false);
        setEditFields(fields => ({
            ...fields,
            specificationName: ""
        }));
    };


    return (
        <div className="search-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
            <div className="search-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={logo} alt="Logo" className="search-logo" />
                    <span className="search-title">{t.portalTitle}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {role === "ROLE_ADMIN" && (
                        <button
                            className="admin-button"
                            style={{
                                background: "#FF9F1C",
                                color: "black",
                                fontWeight: 600,
                                borderRadius: 8,
                                padding: "8px 18px",
                                border: "none",
                                cursor: "pointer",
                                marginRight: 12,
                                fontSize: "1rem"
                            }}
                            onClick={() => navigate("/admin")}
                        >
                            <FaUserShield /> Admin
                        </button>
                    )}
                    <button className="lang-button" onClick={() => setLang(l => l === 'EN' ? 'TR' : 'EN')}>
                        {lang}
                    </button>
                    <button onClick={handleLogout} className="logout-button"><FaSignOutAlt /> {t.logout}</button>
                </div>
            </div>


            {/* SAĞ ÜST ÖNİZLEME */}
            {selectedRows.length > 0 && (
                <div
                    className="preview-chip"
                    onClick={() => setShowPreviewModal(true)}
                    title={t.detailsClick}
                >
                    <div className="preview-chip-header">
                        <span className="preview-chip-title">{t.selected}</span>
                        <span className="preview-chip-count">{selectedRows.length}</span>
                        <span className="preview-chip-info">{t.detailsClick}</span>
                    </div>
                    <div className="preview-chip-table-header">
                        <span>{t.category}</span>
                        <span>{t.article}</span>
                        <span style={{ minWidth: 26 }}></span>
                    </div>
                    {selectedRows.slice(0, 4).map(row => (
                        <div key={row.id} className="preview-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 32px', alignItems: 'center' }}>
                            <span className="preview-row-category" title={row.categoryName}>{row.categoryName}</span>
                            <span className="preview-row-article" title={row.article}>{row.article}</span>
                            <span
                                className="preview-remove"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleRemoveSelected(row.id);
                                }}
                                title="Seçilenden çıkar"
                                style={{ justifySelf: 'end' }}
                            >×</span>
                        </div>
                    ))}
                    {selectedRows.length > 4 && (
                        <div className="preview-chip-more">
                            +{selectedRows.length - 4} diğer...
                        </div>
                    )}
                </div>
            )}

            {/* Textarea input */}
            <div className="input-container" style={{ marginTop: "70px" }}>
                <textarea
                    ref={textareaRef}
                    className="ask-input"
                    placeholder={t.searchPlaceholder}
                    value={keyword}
                    onChange={handleKeywordChange}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleClick();
                        }
                    }}
                    rows={1}
                    style={{
                        overflow: 'hidden',
                        minHeight: '80px',
                        maxHeight: '2500px'
                    }}
                />
            </div>

            {results.length > 0 && (
                <div className="result-table-container" style={{ flex: 1, overflowY: 'auto' }}>
                    <table className="result-table">
                        <thead>
                            <tr>
                                <th>{t.category}</th>
                                <th>{t.article}</th>
                                <th>{t.compatibility}</th>
                                <th>{t.comment}</th>
                                <th>{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.categoryName}</td>
                                    <td>{item.article}</td>
                                    <td style={getSuitabilityStyle(item.suitability)}>{item.suitability}</td>
                                    <td>{item.mobiComment}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEdit(item.id)} title={t.edit}><FaPen /></button>
                                            <button onClick={() => handleAdd(item.id)} title={t.select}><FaPlus /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <>
                    <div className="modal-blur" onClick={() => setShowEditModal(false)} />
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{t.edit}</h2>
                        <label>
                            Category:
                            <select
                                name="categoryId"
                                value={editFields.categoryId}
                                onChange={handleFieldChange}
                                style={{ width: "90%", minHeight: 38, borderRadius: 8, marginBottom: 12 }}
                            >
                                <option value="">{t.select}</option>
                                {categoryOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>


                        </label>
                        <label>
                            {t.article}:
                            <textarea
                                name="article"
                                value={editFields.article}
                                onChange={handleFieldChange}
                                rows={6}
                                style={{
                                    resize: 'vertical',
                                    width: '90%',
                                    minHeight: '90px',
                                    fontSize: '1.08rem',
                                    borderRadius: '9px',
                                    border: '1px solid #e0e0e0',
                                    background: '#f7f8fa',
                                    padding: '16px 12px'
                                }}
                            />
                        </label>
                        <label>
                            {t.compatibility}:
                            <select
                                name="suitability"
                                value={editFields.suitability}
                                onChange={handleFieldChange}
                                style={{ width: "90%", minHeight: 38, borderRadius: 8, marginBottom: 12 }}
                            >
                                <option value="">{t.select}</option>
                                <option value="Uygun">Uygun</option>
                                <option value="Kısmen Uygun">Kısmen Uygun</option>
                                <option value="Uygun Değil">Uygun Değil</option>
                            </select>
                        </label>
                        <label>
                            {t.comment}:
                            <textarea
                                name="mobiComment"
                                value={editFields.mobiComment}
                                onChange={handleFieldChange}
                                rows={3}
                                style={{
                                    resize: 'vertical',
                                    width: '90%',
                                    minHeight: '60px',
                                    fontSize: '1.08rem',
                                    borderRadius: '9px',
                                    border: '1px solid #e0e0e0',
                                    background: '#f7f8fa',
                                    padding: '16px 12px'
                                }}
                            />
                        </label>
                        <div className="modal-actions">
                            <button onClick={() => setShowEditModal(false)}>{t.cancel}</button>
                            <button onClick={handleSaveEdit}>{t.save}</button>
                        </div>
                    </div>
                </>
            )}

            {/* SEÇİLENLERİN DETAY MODALİ */}
            {showPreviewModal && (
                <>
                    <div className="modal-blur" onClick={() => setShowPreviewModal(false)} />
                    <div className="modal-content" style={{ minWidth: 600, maxHeight: 600, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ margin: 0 }}>{t.selected}</h2>
                            <div className="modal-actions right" style={{ gap: 10 }}>
                                <button onClick={handleCloseModal}>{t.close}</button>
                                <button onClick={handleDownloadOnly} style={{ background: "#5e81ac", color: "#fff" }}>{t.download}</button>
                                <button
                                    onClick={handleExportAndUpload}
                                    style={{ background: "#204181", color: "#fff" }}
                                >
                                    {t.export}
                                </button>
                            </div>
                        </div>
                        <input
                            className="specification-name-input"
                            type="text"
                            placeholder={t.specificationName}
                            value={editFields.specificationName || ""}
                            onChange={e => setEditFields(fields => ({
                                ...fields,
                                specificationName: e.target.value
                            }))}
                        />


                        <table className="result-table" style={{ fontSize: 14 }}>
                            <thead>
                                <tr>
                                    <th>{t.category}</th>
                                    <th>{t.article}</th>
                                    <th>{t.compatibility}</th>
                                    <th>{t.comment}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRows.map(row => (
                                    <tr key={row.id}>
                                        <td>{row.categoryName}</td>
                                        <td>{row.article}</td>
                                        <td style={getSuitabilityStyle(row.suitability)}>{row.suitability}</td>
                                        <td>{row.mobiComment}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default Search;
