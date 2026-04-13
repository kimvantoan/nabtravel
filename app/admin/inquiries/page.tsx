"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Phone, Mail, User, Eye, MapPin, Search, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/app/providers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminInquiries() {
  const { dict } = useLanguage();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/admin/inquiries`);
      const data = await res.json();
      if (Array.isArray(data)) setInquiries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(dict.admin.deleteInquiryConfirm)) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/admin/inquiries/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchInquiries();
        if (selectedInquiry?.id === id) {
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openDetailModal = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  const filteredInquiries = inquiries.filter(i => 
    (i.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.phone_number || "").includes(searchTerm) ||
    (i.tour_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime());

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInquiries = filteredInquiries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{dict.admin.inquiriesTitle}</h1>
          <p className="text-gray-500 mt-2">{dict.admin.inquiriesDesc}</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm Email, SĐT, Tên, Mã Tour..." 
            className="pl-9 h-11 w-full rounded-xl bg-white focus-visible:ring-green-500 border-gray-200"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.admin.colCustomer}</TableHead>
              <TableHead>{dict.admin.colContact}</TableHead>
              <TableHead>{dict.admin.colTour}</TableHead>
              <TableHead>{dict.admin.colArrivalDate}</TableHead>
              <TableHead>{dict.admin.colPax}</TableHead>
              <TableHead className="text-right">{dict.admin.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">{dict.admin.loadingData}</TableCell>
              </TableRow>
            ) : currentInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">{dict.admin.noInquiries}</TableCell>
              </TableRow>
            ) : (
              currentInquiries.map((inquiry: any) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <User className="h-4 w-4 text-gray-400" />
                      {inquiry.full_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {inquiry.phone_number}</div>
                      <div className="flex items-center gap-1 text-gray-500"><Mail className="h-3 w-3" /> {inquiry.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/tour/${inquiry.tour_id}`} target="_blank">
                      <Badge variant="secondary" className="max-w-[250px] truncate cursor-pointer hover:bg-blue-100 bg-blue-50 text-blue-700 transition-colors flex items-center gap-1 w-fit">
                        {inquiry.tour_id}
                        <ExternalLink className="w-3 h-3 min-w-3" />
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell>{inquiry.arrival_date ? format(new Date(inquiry.arrival_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                  <TableCell className="text-sm">
                    {inquiry.adults} {dict.admin.adults} <br />
                    {inquiry.children ? `${inquiry.children} ${dict.admin.children}` : ''}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openDetailModal(inquiry)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(inquiry.id)}>
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
              Đang hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredInquiries.length)} trong số {filteredInquiries.length} kết quả
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-3">
              <Search className="w-5 h-5 text-gray-400" />
              {dict.admin.inquiryDetailTitle}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="py-2 space-y-6">
              {/* Thẻ khách hàng */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-4">
                <div className="p-3 bg-white shadow-sm rounded-full h-fit">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-gray-900 text-lg">{selectedInquiry.full_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-gray-400" /> {selectedInquiry.phone_number}</span>
                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-gray-400" /> {selectedInquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" /> 
                    {selectedInquiry.country} {selectedInquiry.city ? `- ${selectedInquiry.city}` : ''}
                  </div>
                </div>
              </div>

              {/* Lưới thông tin */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">{dict.admin.tourRef}</div>
                  <Link href={`/tour/${selectedInquiry.tour_id}`} target="_blank">
                    <Badge variant="secondary" className="px-2 py-1.5 text-sm font-semibold cursor-pointer hover:bg-blue-100 bg-blue-50 text-blue-700 transition-colors flex items-center gap-1 w-fit mt-1">
                      {selectedInquiry.tour_id}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Badge>
                  </Link>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">{dict.admin.arrivalDateLabel}</div>
                  <div className="font-medium text-gray-900 border px-3 py-1.5 rounded-lg bg-gray-50 w-fit">
                    {selectedInquiry.arrival_date ? format(new Date(selectedInquiry.arrival_date), 'dd/MM/yyyy') : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">{dict.admin.paxCount}</div>
                  <div className="font-medium text-gray-900 flex gap-3">
                    <span><span className="text-gray-500 font-normal">{dict.admin.adultsLabel}</span> {selectedInquiry.adults}</span>
                    {selectedInquiry.children > 0 && <span><span className="text-gray-500 font-normal">{dict.admin.childrenLabel}</span> {selectedInquiry.children}</span>}
                    {selectedInquiry.infants > 0 && <span><span className="text-gray-500 font-normal">{dict.admin.infantsLabel}</span> {selectedInquiry.infants}</span>}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">{dict.admin.accommodationLabel}</div>
                  <div className="font-medium text-gray-900">{selectedInquiry.accommodations || 'N/A'}</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="text-sm font-medium text-gray-500 mb-2">{dict.admin.specialReqLabel}</div>
                <div className="bg-orange-50 text-orange-900 p-4 rounded-lg text-[15px] border border-orange-100 min-h-[80px]">
                  {selectedInquiry.special_requirements ? selectedInquiry.special_requirements : <span className="text-orange-400 italic">{dict.admin.noSpecialReq}</span>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
