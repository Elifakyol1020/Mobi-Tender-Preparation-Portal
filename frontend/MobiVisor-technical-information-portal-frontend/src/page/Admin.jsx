import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "../image/logo.png";
import "../css/Admin.css";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaFileAlt, FaUser, FaClipboardList } from "react-icons/fa";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return dateStr.replace("T", " ").slice(0, 19);
}

const translations = {
  EN: {
    adminTitle: "Tender Preparation Portal Admin Panel",
    search: "Search",
    logout: "Logout",
    specifications: "Specifications",
    users: "Users",
    upload: "Upload",
    noSpec: "No specification found.",
    articleCount: "article",
    download: "Download",
    delete: "Delete",
    areYouSure: "Are you sure you want to delete?",
    cancel: "Cancel",
    save: "Save",
    yesDelete: "Yes, Delete",
    category: "Category",
    article: "Article",
    compatibility: "Compatibility",
    comment: "Comment",
    actions: "Actions",
    edit: "Edit",
    clearSearch: "Clear Search",
    searchPlaceholder: "Search...",
    noUsers: "No users found.",
    add: "Add",
    email: "Email",
    username: "Username",
    password: "Password",
    role: "Role",
    admin: "ADMIN",
    user: "User",
    editUser: "Edit User",
    addUser: "Add User",
    uploadTitle: "Upload",
    uploadDesc: "The file you upload must be in the following format.",
    clickDownload: "(click and download)",
    select: "Select",
    general: "General",
    security: "Security",
    management: "Management",
    use: "Use",
    reporting: "Reporting",
    uygun: "Uygun",
    kismenUygun: "Kısmen Uygun",
    uygunDegil: "Uygun Değil",
    selectedFile: "Selected file:",
    loading: "Loading...",
    failedLoad: "Users could not be loaded.",
    failedAdd: "User could not be added.",
    failedUpdate: "User could not be updated.",
    failedDelete: "User could not be deleted.",
    failedEdit: "Edit failed.",
    failedUpload: "Upload failed.",
    successUpload: "Upload successful!",
    successDelete: "Specification deleted.",
    deleteSpecConfirm: 'Are you sure you want to delete the specification named',
    continue: "Continue",
    authenticationLogs: "Authentication Logs",
    noLogs: "No logs found.",
    dt: "Date/Time",
    clearLogs: "Clear All Logs",
    clearLogsConfirm: "Are you sure you want to delete all logs?",

  },
  TR: {
    adminTitle: "Tender Preparation Portal Admin Panel",
    search: "Ara",
    logout: "Çıkış",
    specifications: "Şartnameler",
    users: "Kullanıcılar",
    upload: "Yükle",
    noSpec: "Şartname bulunamadı.",
    articleCount: "madde",
    download: "İndir",
    delete: "Sil",
    areYouSure: "Silmek istediğinize emin misiniz?",
    cancel: "İptal",
    save: "Kaydet",
    yesDelete: "Evet, Sil",
    category: "Kategori",
    article: "Madde",
    compatibility: "Uyumluluk",
    comment: "Yorum",
    actions: "İşlemler",
    edit: "Düzenle",
    clearSearch: "Aramayı Temizle",
    searchPlaceholder: "Ara...",
    noUsers: "Kullanıcı bulunamadı.",
    add: "Ekle",
    email: "E-posta",
    username: "Kullanıcı Adı",
    password: "Şifre",
    role: "Rol",
    admin: "YÖNETİCİ",
    user: "Kullanıcı",
    editUser: "Kullanıcıyı Düzenle",
    addUser: "Kullanıcı Ekle",
    uploadTitle: "Yükle",
    uploadDesc: "Yükleyeceğiniz dosya aşağıdaki formatta olmalı.",
    clickDownload: "(tıkla ve indir)",
    select: "Seç",
    general: "Genel",
    security: "Güvenlik",
    management: "Yönetim",
    use: "Kullanım",
    reporting: "Raporlama",
    uygun: "Uygun",
    kismenUygun: "Kısmen Uygun",
    uygunDegil: "Uygun Değil",
    selectedFile: "Seçilen dosya:",
    loading: "Yükleniyor...",
    failedLoad: "Kullanıcılar alınamadı.",
    failedAdd: "Kullanıcı eklenemedi.",
    failedUpdate: "Kullanıcı güncellenemedi.",
    failedDelete: "Kullanıcı silinemedi.",
    failedEdit: "Düzenleme hatası.",
    failedUpload: "Yükleme hatası.",
    successUpload: "Yükleme başarılı!",
    successDelete: "Şartname silindi.",
    deleteSpecConfirm: 'Aşağıdaki isimli şartnameyi silmek istediğine emin misin',
    continue: "Devam Et",
    authenticationLogs: "Kimlik Doğrulama Kayıtları",
    noLogs: "Kayıtlı log bulunamadı.",
    dt: "Tarih/Saat",
    clearLogs: "Tüm Logları Temizle",
    clearLogsConfirm: "Tüm logları silmek istediğine emin misin?",
  }
};

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 4;
const DETAIL_PAGE_SIZE = 20;

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("specifications");
  const [lang, setLang] = useState("EN");
  const t = translations[lang];

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState(null);

  // ----- Specification States -----
  const [specNames, setSpecNames] = useState([]);
  const [selectedSpecName, setSelectedSpecName] = useState(null);
  const [specDetails, setSpecDetails] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadSpecName, setUploadSpecName] = useState("");
  const [uploadSpecId, setUploadSpecId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [specNameError, setSpecNameError] = useState("");


  const [editFields, setEditFields] = useState({
    article: "",
    suitability: "",
    mobiComment: "",
    specificationName: "",
    categoryId: "",
  });


  const [currentPage, setCurrentPage] = useState(1);
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailSearch, setDetailSearch] = useState("");
  const [lastElasticSearch, setLastElasticSearch] = useState("");

  // ----- Logout -----
  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/v1/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
    }
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  // ----- Specifications Data -----
  const fetchSpecNames = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log(token);
      const response = await axios.get(`${API_URL}/api/v1/specifications/with-item-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched spec names:", response.data);
      setSpecNames(response.data || []);
      setCurrentPage(1);
    } catch (error) {
      setSpecNames([]);
    }
  };


  useEffect(() => {
    fetchSpecNames();
  }, []);

  const handleSpecClick = async (id, specificationName) => {
    setSelectedSpecName(specificationName);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_URL}/api/v1/specification-items/by-specification`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { specificationId: id },
        }
      );
      setSpecDetails(response.data || []);
      setDetailsPage(1);
      setDetailSearch("");
      setLastElasticSearch("");
    } catch (error) {
      setSpecDetails([]);
    }
  };



  const handleEdit = (id) => {
    const item = specDetails.find((i) => i.id === id);
    setEditingItem(item);
    setEditFields({
      article: item.article || "",
      suitability: item.suitability || "",
      mobiComment: item.mobiComment || "",
      specificationName: item.specificationName || selectedSpecName || "",
      categoryId: item.categoryId ? String(item.categoryId) : "",
    });
    setShowEditModal(true);
  };


  const handleFieldChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        article: editFields.article,
        suitability: editFields.suitability,
        mobiComment: editFields.mobiComment,
        specificationName: editFields.specificationName,
        categoryId: editFields.categoryId ? Number(editFields.categoryId) : null,
      };
      await axios.put(
        `${API_URL}/api/v1/specification-items/${editingItem.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSpecDetails((prev) =>
        prev.map((item) => {
          if (item.id === editingItem.id) {
            const newCategoryName =
              categoryOptions.find((opt) => opt.value === String(payload.categoryId))?.label || item.categoryName;
            return {
              ...item,
              ...payload,
              categoryName: newCategoryName,
            };
          }
          return item;
        })
      );
      setShowEditModal(false);
    } catch (error) {
      alert(t.failedEdit + ": " + (error.response?.data || error.message));
    }
  };




  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/api/v1/specification-items/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpecDetails((prev) => prev.filter((item) => item.id !== deletingId));
    } catch (error) {
      alert(t.failedDelete + ": " + (error.response?.data || error.message));
    }
    setShowDeleteModal(false);
    setDeletingId(null);
  };


  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const handleOpenUploadModal = () => {
    setShowUploadModal(true);
    setUploadStep(1);
    setUploadSpecName("");
    setUploadFile(null);
    setUploadSpecId(null);
  };


  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      alert("Lütfen bir dosya seçin.");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", uploadFile);

      let uploadedSpecName = selectedSpecName;
      if (!selectedSpecName && uploadFile) {
        uploadedSpecName = uploadFile.name.split(".")[0];
      }
      formData.append("specificationName", uploadedSpecName || "");

      await axios.post(
        `${API_URL}/api/v1/specifications/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(t.successUpload);
      setShowUploadModal(false);

      await fetchSpecNames();

      if (uploadedSpecName) {
        setSelectedSpecName(uploadedSpecName);
        handleSpecClick(uploadedSpecName);
      }
    } catch (error) {
      alert(t.failedUpload + ": " + (error.response?.data || error.message));
    }
    setUploading(false);
  };


  // ====== DOWNLOAD FONKSİYONU ======
  const handleDownloadSpec = async (specificationName) => {
    try {
      const token = localStorage.getItem("accessToken");
      const safeSpecName = specificationName.trim().replace(/\s+/g, "_");
      const filename = `${safeSpecName}.xlsx`;

      const response = await axios.get(
        `${API_URL}/api/v1/specification-items/download/${filename}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(t.download + " " + (error.response?.data || error.message));
    }
  };




  const handleSpecNameChange = (e) => {
    const value = e.target.value;
    setUploadSpecName(value);

    if (!/^[A-Za-z0-9 _-]+$/.test(value) || /[ğĞüÜşŞıİöÖçÇ]/.test(value)) {
      setSpecNameError(
        lang === "TR"
          ? "Lütfen sadece İngilizce harf, rakam, boşluk ve -/_ karakterlerini kullanın."
          : "Please use only English letters, numbers, space, - and _ characters."
      );
    } else {
      setSpecNameError("");
    }
  };



  // ---------- ANA LİSTE PAGINATION ----------
  const totalPages = Math.ceil(specNames.length / PAGE_SIZE);
  const paginatedSpecs = specNames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ---------- DETAY/SATIR ARAMA & PAGINATION ----------
  const filteredDetails =
    lastElasticSearch
      ? specDetails
      : specDetails.filter(
        (spec) =>
          spec.article?.toLowerCase().includes(detailSearch.toLowerCase()) ||
          spec.categoryName?.toLowerCase().includes(detailSearch.toLowerCase()) ||
          spec.suitability?.toLowerCase().includes(detailSearch.toLowerCase()) ||
          spec.mobiComment?.toLowerCase().includes(detailSearch.toLowerCase())
      );
  const totalDetailsPages = Math.ceil(filteredDetails.length / DETAIL_PAGE_SIZE);
  const paginatedDetails = filteredDetails.slice((detailsPage - 1) * DETAIL_PAGE_SIZE, detailsPage * DETAIL_PAGE_SIZE);

  useEffect(() => { setDetailsPage(1); }, [detailSearch, selectedSpecName, lastElasticSearch]);

  const handleElasticSearch = async () => {
    if (!detailSearch.trim()) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/api/v1/search/by-specification-and-keyword`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          keyword: detailSearch,
          specificationName: selectedSpecName
        }
      });
      setSpecDetails(response.data || []);
      setDetailsPage(1);
      setLastElasticSearch(detailSearch);
    } catch (error) {
      alert(t.failedEdit + ": " + (error.response?.data || error.message));
    }
  };

const clearElastic = () => {
    setLastElasticSearch("");
    setDetailSearch("");
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);


  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_URL}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setUserError(t.failedLoad);
      setUsers([]);
    }
    setLoadingUsers(false);
  };

  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserFields, setEditUserFields] = useState({
    email: "",
    username: "",
    role: ""
  });

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserFields({
      email: user.email || "",
      username: user.userName || user.username || "",
      role: user.role || ""
    });
    setShowUserEditModal(true);
  };

  const handleSaveEditUser = async () => {
    if (!editingUser) return;
    try {
      const token = localStorage.getItem("accessToken");

      const updateData = {
        email: editUserFields.email,
        username: editUserFields.username,
        role: editUserFields.role
      };

      await axios.put(
        `${API_URL}/api/v1/users/${editingUser.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUsers(users =>
        users.map(u =>
          u.id === editingUser.id
            ? {
              ...u,
              email: editUserFields.email,
              userName: editUserFields.username,
              role: editUserFields.role
            }
            : u
        )
      );
      setShowUserEditModal(false);
      setEditingUser(null);
    } catch (err) {
      alert(t.failedUpdate + ": " + (err.response?.data || err.message));
    }
  };

  const [showUserAddModal, setShowUserAddModal] = useState(false);
  const [addUserFields, setAddUserFields] = useState({
    email: "",
    username: "",
    password: "",
    role: ""
  });

  const handleSaveAddUser = async () => {

    if (!addUserFields.email || !addUserFields.username || !addUserFields.password || !addUserFields.role) {
      alert("Tüm alanları doldurun!");
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");

      const createData = {
        email: addUserFields.email,
        username: addUserFields.username,
        password: addUserFields.password,
        role: addUserFields.role
      };

      const response = await axios.post(
        `${API_URL}/api/v1/users`,
        createData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUsers(users => [...users, response.data]);
      setShowUserAddModal(false);
      setAddUserFields({ email: "", username: "", password: "", role: "" });
    } catch (err) {
      alert(t.failedAdd + ": " + (err.response?.data || err.message));
    }
  };

  const categoryOptions = [
    { value: "1", label: t.general },
    { value: "2", label: t.security },
    { value: "3", label: t.management },
    { value: "4", label: t.use },
    { value: "5", label: t.reporting },
  ];

  const handleDeleteSpec = async (id, specificationName) => {
    if (!window.confirm(`"${specificationName}" ${t.deleteSpecConfirm}?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/api/v1/specifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSpecNames();
      if (selectedSpecName === specificationName) {
        setSelectedSpecName(null);
        setSpecDetails([]);
      }
      alert(t.successDelete);
    } catch (error) {
      alert(t.failedDelete + ": " + (error.response?.data || error.message));
    }
  };

  const handleContinueSpecName = async () => {
    if (!uploadSpecName) {
      alert("Please enter a specification name.");
      return;
    }
    try {
      setUploading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${API_URL}/api/v1/specifications`,
        { specificationName: uploadSpecName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setUploadSpecId(response.data.id);
      setUploadStep(2);
    } catch (error) {
      alert("Specification create failed: " + (error.response?.data || error.message));
    }
    setUploading(false);
  };


  const handleUploadSpecFile = async () => {
    if (!uploadFile || !uploadSpecId) {
      alert("Please select a file.");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("specificationId", uploadSpecId);

      await axios.post(
        `${API_URL}/api/v1/specification-items/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );
      alert("Upload successful!");
      setShowUploadModal(false);
      setUploadStep(1);
      setUploadSpecName("");
      setUploadFile(null);
      setUploadSpecId(null);
      await fetchSpecNames();
    } catch (error) {
      alert("Upload failed: " + (error.response?.data || error.message));
    }
    setUploading(false);
  };

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logError, setLogError] = useState(null);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setLogError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_URL}/api/v1/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      setLogError("Loglar alınamadı.");
      setLogs([]);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab]);

  const handleClearLogs = async () => {
    if (!window.confirm(t.clearLogsConfirm)) return;
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/api/v1/logs/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs([]);
    } catch (err) {
      alert(t.failedDelete + ": " + (err.response?.data || err.message));
    }
    setLoadingLogs(false);
  };

  // --- RENDER ---
  return (
    <div className="admin-root">
      <header className="admin-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="admin-logo-title" style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Logo" className="admin-logo" />
          <span className="admin-title" style={{ marginRight: 18 }}>
            {t.adminTitle}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            className="admin-search-button"
            style={{
              padding: "8px 18px",
              background: "#FF9F1C",
              border: "none",
              borderRadius: "8px",
              color: "black",
              fontWeight: 600,
              fontSize: "1em",
              marginRight: 15,
              cursor: "pointer"
            }}
            onClick={() => navigate("/user/search")}
          >
            {t.search}
          </button>
          <button
            className="admin-lang-button"
            style={{
              padding: "7px 18px",
              background: "#204181",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: 600,
              fontSize: "1em",
              marginRight: 15,
              cursor: "pointer"
            }}
            onClick={() => setLang(lang === "EN" ? "TR" : "EN")}
          >
            {lang}
          </button>
          <button onClick={handleLogout} className="admin-logout-button">
            🔓 {t.logout}
          </button>
        </div>
      </header>


      <div className="admin-tab-row" style={{
        display: "flex",
        borderBottom: "2px solid #e3e3e3",
        marginBottom: 24,
        gap: 15,
        background: "#fff",
        marginTop: 15,
      }}>
        <button
          className={`admin-tab-btn${activeTab === "specifications" ? " active" : ""}`}
          onClick={() => setActiveTab("specifications")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            border: "none",
            borderBottom: activeTab === "specifications" ? "4px solid #4660e4" : "4px solid transparent",
            background: "none",
            fontWeight: 700,
            fontSize: "1.1em",
            color: activeTab === "specifications" ? "#4660e4" : "#626678",
            cursor: "pointer"
          }}
        >
          <FaFileAlt style={{ fontSize: "1.1em" }} /> {t.specifications}
        </button>
        <button
          className={`admin-tab-btn${activeTab === "users" ? " active" : ""}`}
          onClick={() => setActiveTab("users")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            border: "none",
            borderBottom: activeTab === "users" ? "4px solid #4660e4" : "4px solid transparent",
            background: "none",
            fontWeight: 700,
            fontSize: "1.1em",
            color: activeTab === "users" ? "#4660e4" : "#626678",
            cursor: "pointer"
          }}
        >
          <FaUsers style={{ fontSize: "1.1em" }} /> {t.users}
        </button>
        <button
          className={`admin-tab-btn${activeTab === "logs" ? " active" : ""}`}
          onClick={() => setActiveTab("logs")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            border: "none",
            borderBottom: activeTab === "logs" ? "4px solid #4660e4" : "4px solid transparent",
            background: "none",
            fontWeight: 700,
            fontSize: "1.1em",
            color: activeTab === "logs" ? "#4660e4" : "#626678",
            cursor: "pointer"
          }}
        >
          <FaClipboardList style={{ fontSize: "1.1em" }} /> Logs
        </button>

      </div>

      <main className="admin-content">
        {activeTab === "specifications" && (
          <>
            <div className="spec-heading-row">
              <h2 className="spec-heading">📁 {t.specifications}</h2>
              <button className="upload-btn" onClick={handleOpenUploadModal}>
                ⬆️ {t.upload}
              </button>
            </div>
            <ul className="spec-list">
              {specNames.length === 0 ? (
                <li className="spec-item">{t.noSpec}</li>
              ) : (
                paginatedSpecs.map((spec, index) => (
                  <li
                    key={spec.id}
                    className="spec-item clickable"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <span
                      onClick={() => handleSpecClick(spec.id, spec.specificationName)}
                      style={{
                        flex: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <span style={{ marginRight: 10 }}>{spec.specificationName}</span>
                      <span
                        style={{
                          fontSize: "0.95em",
                          background: "#e7e9fb",
                          color: "#4660e4",
                          borderRadius: 8,
                          padding: "2px 8px",
                          fontWeight: 500,
                          marginLeft: 5,
                          minWidth: 28,
                          display: "inline-block",
                          textAlign: "center"
                        }}
                        title="Madde/Satır sayısı"
                      >
                        {spec.itemCount} {t.articleCount}
                      </span>
                    </span>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleDownloadSpec(spec.specificationName); }}
                        className="action-button download"
                        style={{ marginLeft: 0 }}
                        title={t.download}
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteSpec(spec.id, spec.specificationName); }}
                        className="action-button delete"
                        style={{ marginLeft: 0 }}
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>

            {specNames.length > PAGE_SIZE && (
              <div className="pagination-row">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`pagination-btn${currentPage === i + 1 ? " active" : ""}`}
                    style={{
                      margin: "0 4px",
                      border: "1px solid #4660e4",
                      borderRadius: "8px",
                      background: currentPage === i + 1 ? "#4660e4" : "#fff",
                      color: currentPage === i + 1 ? "#fff" : "#4660e4",
                      padding: "6px 16px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            {selectedSpecName && (
              <div className="spec-table-container">
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14
                }}>
                  <h4 className="spec-table-heading" style={{ margin: 0, padding: 0 }}>
                    📁 {selectedSpecName}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={detailSearch}
                      onChange={e => {
                        setDetailSearch(e.target.value);
                        setLastElasticSearch("");
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleElasticSearch();
                      }}
                      className="spec-search-input"
                      style={{
                        padding: "7px 12px",
                        border: "1px solid #bbb",
                        borderRadius: 8,
                        minWidth: 500,
                        minHeight: 33,
                        fontSize: "0.9em"
                      }}
                    />
                    {!lastElasticSearch && (
                      <button
                        onClick={handleElasticSearch}
                        style={{
                          background: "#FF9F1C",
                          color: "black",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 20px",
                          fontWeight: 600,
                          fontSize: "1em",
                          cursor: "pointer"
                        }}
                      >
                        {t.search}
                      </button>
                    )}
                    {lastElasticSearch && (
                      <button onClick={clearElastic}
                        style={{
                          background: "#FF9F1C",
                          color: "black",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 20px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >{t.clearSearch}</button>
                    )}
                  </div>
                </div>
                <table className="spec-table">
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
                    {paginatedDetails.map((spec) => (
                      <tr key={spec.id}>
                        <td>{spec.categoryName}</td>
                        <td>{spec.article}</td>
                        <td>{spec.suitability}</td>
                        <td>{spec.mobiComment}</td>
                        <td>
                          <button onClick={() => handleEdit(spec.id)} className="action-button edit">✏️</button>
                          <button onClick={() => handleDeleteClick(spec.id)} className="action-button delete">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredDetails.length > DETAIL_PAGE_SIZE && (
                  <div className="pagination-row" style={{ marginTop: 16 }}>
                    {Array.from({ length: totalDetailsPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setDetailsPage(i + 1)}
                        className={`pagination-btn${detailsPage === i + 1 ? " active" : ""}`}
                        style={{
                          margin: "0 4px",
                          border: "1px solid #4660e4",
                          borderRadius: "8px",
                          background: detailsPage === i + 1 ? "#4660e4" : "#fff",
                          color: detailsPage === i + 1 ? "#fff" : "#4660e4",
                          padding: "6px 16px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {activeTab === "users" && (
          <div
            style={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: users.length === 0 ? "center" : "flex-start",
              color: "#4660e4",
              fontSize: "1.1em",
              fontWeight: 500,
              width: "100%",
              paddingLeft: 60,
              fontFamily: "Inter, sans-serif",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 30,
                width: "90%",
                maxWidth: "calc(100% - 60px)",
              }}
            >
              <h2
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: 0,
                  fontSize: "1.4em",
                  fontWeight: 700,
                  color: "#4660e4",
                }}
              >
                <FaUsers /> {t.users}
              </h2>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 24px",
                  borderRadius: 8,
                  background: "#4660e4",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1em",
                  boxShadow: "0 1px 5px #e6e7f1",
                  transition: "background 0.18s",
                  marginLeft: "auto"
                }}
                onClick={() => setShowUserAddModal(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                {t.add}
              </button>
            </div>
            {loadingUsers && <div>{t.loading}</div>}
            {userError && <div style={{ color: "red" }}>{userError}</div>}
            {!loadingUsers && users.length === 0 && !userError && (
              <div style={{ color: "#999" }}>{t.noUsers}</div>
            )}
            {!loadingUsers && users.length > 0 && (
              <ul
                style={{
                  width: 650,
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                  borderRadius: 12,
                  background: "#f6f8fc",
                  boxShadow: "0 2px 12px #e6e7f1",
                  border: "1px solid #e5e7eb",
                }}
              >
                {users.map((user) => (
                  <li
                    key={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 30,
                      padding: "15px 22px",
                      borderBottom: "1px solid #e6e7f1",
                      fontSize: "0.9em",
                    }}
                  >
                    <FaUser style={{ color: "#4660e4", fontSize: "1.2em" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#000134", fontWeight: 700 }}>
                        {t.email} : {user.email}
                      </div>
                      <div style={{ color: "#000134", fontSize: "0.95em", marginTop: 2 }}>
                        {t.username} : {user.userName || user.username}
                      </div>
                      <div style={{ color: "#000134", fontSize: "0.95em", marginTop: 2 }}>
                        {t.role} : {user.role}
                      </div>
                    </div>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 16px",
                        borderRadius: 8,
                        background: "#e6ebff",
                        color: "#4660e4",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "0.95em",
                        transition: "background 0.18s",
                      }}
                      onClick={() => handleEditUser(user)}
                    >
                      <span style={{ fontSize: "1.08em" }}>✏️</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      {/* MODALS */}
      {showEditModal && (
        <>
          <div className="admin-modal-blur" onClick={() => setShowEditModal(false)} />
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t.edit}</h2>
            <label>
              {t.category}:
              <select
                name="categoryId"
                value={editFields.categoryId || ""}
                onChange={handleFieldChange}
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
                style={{ height: "auto", minHeight: "120px" }}
              />
            </label>
            <label>
              {t.compatibility}:
              <select name="suitability" value={editFields.suitability} onChange={handleFieldChange}>
                <option value="">{t.select}</option>
                <option value={t.uygun}>{t.uygun}</option>
                <option value={t.kismenUygun}>{t.kismenUygun}</option>
                <option value={t.uygunDegil}>{t.uygunDegil}</option>
              </select>
            </label>
            <label>
              {t.comment}:
              <textarea
                name="mobiComment"
                value={editFields.mobiComment}
                onChange={handleFieldChange}
                style={{ height: "auto", minHeight: "120px" }}
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>{t.cancel}</button>
              <button onClick={handleSaveEdit}>{t.save}</button>
            </div>
          </div>
        </>
      )}

      {showDeleteModal && (
        <>
          <div className="admin-modal-blur" onClick={handleCancelDelete} />
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t.areYouSure}</h3>
            <div className="modal-actions">
              <button onClick={handleCancelDelete}>{t.cancel}</button>
              <button onClick={handleConfirmDelete} style={{ background: "#c62828", color: "#fff" }}>
                {t.yesDelete}
              </button>
            </div>
          </div>
        </>
      )}

      {showUploadModal && (
        <>
          <div className="admin-modal-blur" onClick={() => setShowUploadModal(false)} />
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <h2>{t.uploadTitle}</h2>
            {/* Step 1: Sadece isim */}
            {uploadStep === 1 && (
              <>
                <label style={{ fontWeight: 600, fontSize: 16, marginBottom: 10, display: "block" }}>
                  {lang === "TR" ? "Şartname Adı" : "Specification Name"}:
                </label>
                <input
                  type="text"
                  value={uploadSpecName}
                  onChange={handleSpecNameChange}
                  placeholder={lang === "TR" ? "Şartname Adı giriniz" : "Enter Specification Name"}
                  style={{
                    marginBottom: 8,
                    width: "100%",
                    padding: "8px",
                    borderRadius: 8,
                    border: "1px solid #bbb",
                    fontSize: "1.1em"
                  }}
                />
                {specNameError && (
                  <div style={{ color: "#c62828", marginBottom: 10, fontSize: 15 }}>{specNameError}</div>
                )}
                <div className="modal-actions">
                  <button onClick={() => setShowUploadModal(false)}>{t.cancel}</button>
                  <button
                    onClick={handleContinueSpecName}
                    disabled={!uploadSpecName || uploading || !!specNameError}
                  >
                    {t.continue}
                  </button>
                </div>

              </>
            )}

            {/* Step 2: Dosya yükle */}
            {uploadStep === 2 && (
              <>
                <input
                  type="file"
                  accept=".xlsx,.xls,.ods"
                  style={{ marginBottom: 16 }}
                  onChange={e => setUploadFile(e.target.files[0])}
                />
                <div style={{ marginBottom: 16, fontSize: '0.96em', color: '#3648a5' }}>
                  {t.selectedFile} <b>{uploadFile ? uploadFile.name : ""}</b>
                </div>
                <div className="modal-actions">
                  <button onClick={() => { setUploadStep(1); setUploadFile(null); }}>{t.cancel}</button>
                  <button onClick={handleUploadSpecFile} disabled={uploading || !uploadFile}>
                    {uploading ? t.loading : t.save}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}



      {showUserEditModal && (
        <>
          <div className="admin-modal-blur" onClick={() => setShowUserEditModal(false)} />
          <div className="admin-modal-modern" onClick={e => e.stopPropagation()}>
            <h2>{t.editUser}</h2>
            <div className="modal-field">
              <label>{t.email}:</label>
              <input
                name="email"
                type="email"
                value={editUserFields.email}
                onChange={e => setEditUserFields({ ...editUserFields, email: e.target.value })}
              />
            </div>
            <div className="modal-field">
              <label>{t.username}:</label>
              <input
                name="username"
                type="text"
                value={editUserFields.username}
                onChange={e => setEditUserFields({ ...editUserFields, username: e.target.value })}
              />
            </div>
            <div className="modal-field">
              <label>{t.role}:</label>
              <select
                name="role"
                value={editUserFields.role}
                onChange={e => setEditUserFields({ ...editUserFields, role: e.target.value })}
              >
                <option value="">{t.select}</option>
                <option value="ADMIN">{t.admin}</option>
                <option value="USER">{t.user}</option>
              </select>
            </div>
            <div className="modal-actions-modern">
              <button className="cancel-btn" onClick={() => setShowUserEditModal(false)}>{t.cancel}</button>
              <button className="save-btn" onClick={async () => { await handleSaveEditUser(); }}>{t.save}</button>
            </div>
          </div>
        </>
      )}

      {showUserAddModal && (
        <>
          <div className="admin-modal-blur" onClick={() => setShowUserAddModal(false)} />
          <div className="admin-modal-modern" onClick={e => e.stopPropagation()}>
            <h2>{t.addUser}</h2>
            <div className="modal-field">
              <label>{t.email}:</label>
              <input
                name="email"
                type="email"
                value={addUserFields.email}
                onChange={e => setAddUserFields({ ...addUserFields, email: e.target.value })}
              />
            </div>
            <div className="modal-field">
              <label>{t.username}:</label>
              <input
                name="username"
                type="text"
                value={addUserFields.username}
                onChange={e => setAddUserFields({ ...addUserFields, username: e.target.value })}
              />
            </div>
            <div className="modal-field">
              <label>{t.password}:</label>
              <input
                name="password"
                type="password"
                value={addUserFields.password}
                onChange={e => setAddUserFields({ ...addUserFields, password: e.target.value })}
                minLength={6}
              />
            </div>
            <div className="modal-field">
              <label>{t.role}:</label>
              <select
                name="role"
                value={addUserFields.role}
                onChange={e => setAddUserFields({ ...addUserFields, role: e.target.value })}
              >
                <option value="">{t.select}</option>
                <option value="ADMIN">{t.admin}</option>
                <option value="USER">{t.user}</option>
              </select>
            </div>
            <div className="modal-actions-modern">
              <button className="cancel-btn" onClick={() => setShowUserAddModal(false)}>{t.cancel}</button>
              <button className="save-btn" onClick={handleSaveAddUser}>{t.save}</button>
            </div>
          </div>
        </>
      )}

      {activeTab === "logs" && (
        <div
          style={{
            minHeight: 1500,
            width: "95%",
            paddingLeft: 80,
            fontFamily: "Inter, sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            position: "relative"
          }}
        >
          <div style={{
            width: "95%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            left: 0,
            background: "white",
            zIndex: 2,
            height: 48,
          }}>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: 0,
                fontSize: "1.4em",
                fontWeight: 700,
                color: "#4660e4",
              }}
            >
              <FaClipboardList /> {t.authenticationLogs}
            </h2>
            <button
              onClick={handleClearLogs}
              disabled={loadingLogs || logs.length === 0}
              style={{
                padding: "8px 22px",
                marginRight: 20,
                background: "#c62828",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1em",
                border: "none",
                borderRadius: 8,
                cursor: loadingLogs || logs.length === 0 ? "not-allowed" : "pointer",
                opacity: loadingLogs || logs.length === 0 ? 0.5 : 1,
                transition: "opacity 0.18s"
              }}
            >
              {t.clearLogs}
            </button>
          </div>

          <div style={{ width: "100%", marginTop: 40 ,marginLeft: 20 }}>
            {loadingLogs && <div>{t.loading}</div>}
            {logError && <div style={{ color: "red" }}>{logError}</div>}
            {!loadingLogs && logs.length === 0 && !logError && (
              <div style={{ color: "#999" }}>{t.noLogs}</div>
            )}
            {!loadingLogs && logs.length > 0 && (
              <div style={{ width: "90%", overflowX: "auto" }}>
                <table
                  style={{
                    background: "#f6f8fc",
                    borderRadius: 10,
                    padding: 12,
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    minWidth: 640
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px" }}>ID</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>{t.user}</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>{t.role}</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>{t.dt}</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td style={{ padding: "6px 8px" }}>{log.id}</td>
                        <td style={{ padding: "6px 8px" }}>{log.username}</td>
                        <td style={{ padding: "6px 8px" }}>{log.role?.replace("ROLE_", "")}</td>
                        <td style={{ padding: "6px 8px" }}>{formatDate(log.loginTime)}</td>
                        <td style={{ padding: "6px 8px" }}>{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
