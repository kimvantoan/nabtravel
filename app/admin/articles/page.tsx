"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Image as ImageIcon, ExternalLink, Copy, Check, Search } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/app/providers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function AdminArticles() {
  const { dict } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: "",
    thumbnail_url: "",
    thumbnail_file: null as File | null,
    content: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/admin/articles`);
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ title: "", thumbnail_url: "", content: "", thumbnail_file: null });
    setThumbnailPreview(null);
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (article: any) => {
    setModalMode("edit");
    setCurrentId(article.id);
    setIsModalOpen(true);

    // Fetch full article content since index only has excerpt
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/articles/${article.slug}`);
      const data = await res.json();
      const initialThumb = data.image === '/images/default-hotel.jpg' ? '' : (data.image || "");
      setFormData({
        title: data.title || "",
        thumbnail_url: initialThumb,
        thumbnail_file: null,
        content: data.content || ""
      });
      setThumbnailPreview(initialThumb ? `${backendUrl}${initialThumb}` : null);
    } catch (error) {
      console.error(error);
      setFormData({ title: article.title, thumbnail_url: "", thumbnail_file: null, content: "" });
      setThumbnailPreview(null);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return alert(dict.admin.fillRequired);
    setIsSaving(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
      const url = modalMode === "create"
        ? `${backendUrl}/api/admin/articles`
        : `${backendUrl}/api/admin/articles/${currentId}`;

      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('content', formData.content);
      if (formData.thumbnail_url) formPayload.append('thumbnail_url', formData.thumbnail_url);
      if (formData.thumbnail_file) formPayload.append('thumbnail_file', formData.thumbnail_file);

      // When edit and using FormData, Laravel needs _method=PATCH
      if (modalMode === "edit") {
        formPayload.append('_method', 'PATCH');
      }

      const res = await fetch(url, {
        method: 'POST',
        body: formPayload
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchArticles();
      } else {
        alert(dict.admin.saveFailed);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(dict.admin.deleteArticleConfirm)) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/admin/articles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/article/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(slug);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredArticles = articles.filter(a =>
    (a.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.slug || "").toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.publishedAt || b.created_at || b.id).getTime() - new Date(a.publishedAt || a.created_at || a.id).getTime());

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{dict.admin.articlesTitle}</h1>
          <p className="text-gray-500 mt-2">{dict.admin.articlesDesc}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm Tiêu đề, Link bài..."
              className="pl-9 h-11 w-full rounded-xl bg-white focus-visible:ring-green-500 border-gray-200"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button onClick={openCreateModal} className="flex shrink-0 items-center justify-center gap-2 h-11 px-5 bg-[#10a36e] rounded-xl hover:bg-[#0e8a5d]">
            <Plus className="w-4 h-4" /> {dict.admin.addArticleBtn}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.admin.colTitle}</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>{dict.admin.colDate}</TableHead>
              <TableHead className="text-right">{dict.admin.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">{dict.admin.loadingData}</TableCell>
              </TableRow>
            ) : currentArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">{dict.admin.noArticles}</TableCell>
              </TableRow>
            ) : (
              currentArticles.map((article: any) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">{article.title}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/article/${article.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-sm font-medium truncate"
                      >
                        /article/{article.slug} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 text-gray-500 hover:text-gray-900 shadow-none border border-gray-200"
                        title="Sao chép link"
                        onClick={() => handleCopyLink(article.slug)}
                      >
                        {copiedLink === article.slug ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(article.publishedAt || article.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openEditModal(article)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4 bg-gray-50 rounded-b-lg">
            <div className="text-sm text-gray-500 font-medium">
              Đang hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredArticles.length)} trong số {filteredArticles.length} kết quả
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="bg-white">
                Trang trước
              </Button>
              <div className="flex items-center justify-center px-4 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm">
                {currentPage} / {totalPages}
              </div>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="bg-white">
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[1000px] w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {modalMode === "edit" ? dict.admin.editArticleModalTitle : dict.admin.addArticleModalTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{dict.admin.articleTitleLabel}</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={dict.admin.articleTitlePlaceholder}
                    className="h-10 text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">{dict.admin.articleThumbnailUrl}</label>
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => {
                      setFormData({ ...formData, thumbnail_url: e.target.value, thumbnail_file: null });
                      setThumbnailPreview(e.target.value);
                    }}
                    placeholder="https://..."
                    className="h-10 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tải Ảnh (Ưu tiên)</label>
                <div
                  className="w-full h-[104px] bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden relative cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => document.getElementById('thumbnailUpload')?.click()}
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs">Upload Ảnh</span>
                    </div>
                  )}
                  <input
                    id="thumbnailUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, thumbnail_file: file, thumbnail_url: '' });
                        setThumbnailPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{dict.admin.articleContentLabel}</label>
                <div className="h-72 mb-10">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    modules={modules}
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>{dict.admin.cancelBtn}</Button>
            <Button className="bg-[#10a36e] hover:bg-[#0e8a5d]" onClick={handleSave} disabled={isSaving}>
              {isSaving ? dict.admin.savingBtn : dict.admin.saveBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
