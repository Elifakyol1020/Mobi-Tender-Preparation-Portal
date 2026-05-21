import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../css/Search.css";
import logo from "../image/logo.png";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/env";
import { searchTranslations } from "../constants/i18n";
import {
    FaDownload,
    FaEdit,
    FaPlus,
    FaSearch,
    FaSignOutAlt,
    FaTimes,
    FaUserShield,
} from "react-icons/fa";

const PAGE_SIZE = 10;

function Search() {
    const [lang, setLang] = useState("EN");
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [exportName, setExportName] = useState("");
    const [editFields, setEditFields] = useState({
        categoryId: "",
        article: "",
        suitability: "",
        mobiComment: "",
        specificationId: "",
    });

    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const t = searchTranslations[lang];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword]);

    const authHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [itemsResponse, categoriesResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/v1/specification-items`, { headers: authHeaders() }),
                axios.get(`${API_BASE_URL}/api/categories`, { headers: authHeaders() }),
            ]);
            setItems(itemsResponse.data || []);
            setCategories(categoriesResponse.data || []);
        } catch (error) {
            setItems([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        if (!query) return items;
        return items.filter((item) =>
            [
                item.article,
                item.suitability,
                item.mobiComment,
                item.specificationName,
                item.categoryName,
            ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query))
        );
    }, [items, keyword]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
    const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getSuitabilityClass = (suitability = "") => {
        const value = suitability.toLowerCase();
        if (value.includes("uygun değil")) return "danger";
        if (value.includes("kısmen uygun")) return "warning";
        if (value.includes("uygun")) return "success";
        return "neutral";
    };

    const handleLogout = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/");
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/api/v1/auth/logout`, {}, { headers: authHeaders() });
        } finally {
            localStorage.removeItem("accessToken");
            navigate("/");
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditFields({
            categoryId: item.categoryId ? String(item.categoryId) : "",
            article: item.article || "",
            suitability: item.suitability || "",
            mobiComment: item.mobiComment || "",
            specificationId: item.specificationId || "",
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        const payload = {
            article: editFields.article,
            suitability: editFields.suitability,
            mobiComment: editFields.mobiComment,
            specificationId: editFields.specificationId ? Number(editFields.specificationId) : null,
            categoryId: editFields.categoryId ? Number(editFields.categoryId) : null,
        };

        await axios.put(`${API_BASE_URL}/api/v1/specification-items/${editingItem.id}`, payload, {
            headers: { ...authHeaders(), "Content-Type": "application/json" },
        });

        const category = categories.find((item) => String(item.id) === String(editFields.categoryId));
        setItems((prev) =>
            prev.map((item) =>
                item.id === editingItem.id
                    ? {
                        ...item,
                        ...payload,
                        categoryName: category?.categoryName || item.categoryName,
                        categoryId: payload.categoryId,
                    }
                    : item
            )
        );
        setShowEditModal(false);
    };

    const handleAdd = (item) => {
        setSelectedRows((prev) => (prev.some((row) => row.id === item.id) ? prev : [...prev, item]));
    };

    const handleRemoveSelected = (id) => {
        setSelectedRows((prev) => prev.filter((row) => row.id !== id));
    };

    const handleDownloadOnly = async () => {
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/specification-items/export-selected`,
            { selectedIds: selectedRows.map((row) => row.id), newSpecificationName: exportName },
            { headers: { ...authHeaders(), "Content-Type": "application/json" }, responseType: "blob" }
        );
        const filename = `${exportName || "export"}.xlsx`;
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleExportAndUpload = async () => {
        await axios.post(
            `${API_BASE_URL}/api/v1/specification-items/duplicate-and-export`,
            { selectedIds: selectedRows.map((row) => row.id), newSpecificationName: exportName },
            { headers: { ...authHeaders(), "Content-Type": "application/json" } }
        );
        setShowPreviewModal(false);
    };

    return (
        <div className="search-root">
            <header className="search-header">
                <div className="search-brand">
                    <img src={logo} alt="Logo" className="search-logo" />
                    <span className="search-title">{t.portalTitle}</span>
                </div>
                <div className="search-header-actions">
                    {role === "ROLE_ADMIN" && (
                        <button className="admin-button" onClick={() => navigate("/admin")}>
                            <FaUserShield /> Admin
                        </button>
                    )}
                    <button className="lang-button" onClick={() => setLang((value) => (value === "EN" ? "TR" : "EN"))}>
                        {lang}
                    </button>
                    <button onClick={handleLogout} className="logout-button">
                        <FaSignOutAlt /> {t.logout}
                    </button>
                </div>
            </header>

            <main className="workspace-shell">
                <section className="workspace-toolbar">
                    <div>
                        <p className="workspace-eyebrow">{t.selected}: {selectedRows.length}</p>
                        <h1>{t.portalTitle}</h1>
                    </div>
                    <div className="search-box">
                        <FaSearch />
                        <input
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") setCurrentPage(1);
                            }}
                            placeholder={t.searchPlaceholder}
                        />
                    </div>
                </section>

                {selectedRows.length > 0 && (
                    <section className="selection-strip">
                        <span>{selectedRows.length} {t.selected}</span>
                        <button onClick={() => setShowPreviewModal(true)}>{t.detailsClick}</button>
                    </section>
                )}

                <section className="article-panel">
                    {loading ? (
                        <div className="empty-state">{t.loading}</div>
                    ) : (
                        <>
                            <div className="article-list">
                                {paginatedItems.map((item) => (
                                    <article className="article-card" key={item.id}>
                                        <div className="article-card-main">
                                            <div className="article-card-meta">
                                                <span>{item.categoryName || "GENERAL"}</span>
                                                <span>{item.specificationName}</span>
                                                <span className={`status-pill ${getSuitabilityClass(item.suitability)}`}>
                                                    {item.suitability || "-"}
                                                </span>
                                            </div>
                                            <p className="article-text">{item.article}</p>
                                            {item.mobiComment && <p className="article-comment">{item.mobiComment}</p>}
                                        </div>
                                        <div className="article-actions">
                                            <button onClick={() => handleEdit(item)} title={t.edit}><FaEdit /></button>
                                            <button onClick={() => handleAdd(item)} title={t.select}><FaPlus /></button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="pagination-bar">
                                <span>{filteredItems.length} {t.articleCount}</span>
                                <div>
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <button
                                            key={index}
                                            className={currentPage === index + 1 ? "active" : ""}
                                            onClick={() => setCurrentPage(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>

            {showEditModal && (
                <>
                    <div className="modal-blur" onClick={() => setShowEditModal(false)} />
                    <div className="modal-content edit-modal" onClick={(event) => event.stopPropagation()}>
                        <h2>{t.edit}</h2>
                        <label>
                            {t.category}
                            <select
                                name="categoryId"
                                value={editFields.categoryId}
                                onChange={(event) => setEditFields((prev) => ({ ...prev, categoryId: event.target.value }))}
                            >
                                <option value="">{t.select}</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.categoryName}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            {t.article}
                            <textarea
                                name="article"
                                value={editFields.article}
                                onChange={(event) => setEditFields((prev) => ({ ...prev, article: event.target.value }))}
                                rows={6}
                            />
                        </label>
                        <label>
                            {t.compatibility}
                            <select
                                name="suitability"
                                value={editFields.suitability}
                                onChange={(event) => setEditFields((prev) => ({ ...prev, suitability: event.target.value }))}
                            >
                                <option value="">{t.select}</option>
                                <option value="Uygun">Uygun</option>
                                <option value="Kısmen Uygun">Kısmen Uygun</option>
                                <option value="Uygun Değil">Uygun Değil</option>
                            </select>
                        </label>
                        <label>
                            {t.comment}
                            <textarea
                                name="mobiComment"
                                value={editFields.mobiComment}
                                onChange={(event) => setEditFields((prev) => ({ ...prev, mobiComment: event.target.value }))}
                                rows={3}
                            />
                        </label>
                        <div className="modal-actions">
                            <button onClick={() => setShowEditModal(false)}>{t.cancel}</button>
                            <button onClick={handleSaveEdit}>{t.save}</button>
                        </div>
                    </div>
                </>
            )}

            {showPreviewModal && (
                <>
                    <div className="modal-blur" onClick={() => setShowPreviewModal(false)} />
                    <div className="modal-content export-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-title-row">
                            <h2>{t.selected}</h2>
                            <button onClick={() => setShowPreviewModal(false)}><FaTimes /></button>
                        </div>
                        <input
                            className="specification-name-input"
                            value={exportName}
                            onChange={(event) => setExportName(event.target.value)}
                            placeholder={t.specificationName}
                        />
                        <div className="selected-list">
                            {selectedRows.map((row) => (
                                <div className="selected-list-row" key={row.id}>
                                    <span>{row.categoryName}</span>
                                    <p>{row.article}</p>
                                    <button onClick={() => handleRemoveSelected(row.id)}><FaTimes /></button>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleDownloadOnly}><FaDownload /> {t.download}</button>
                            <button onClick={handleExportAndUpload}>{t.export}</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Search;
