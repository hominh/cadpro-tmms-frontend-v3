export default function ReportsPage() {
  return (
    <section className="min-h-full px-6 py-12">
      <div className="mx-auto max-w-3xl" role="status">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Trạng thái chuyển đổi
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Báo cáo</h1>
        <p className="mt-3 text-slate-600">
          Mô-đun thống kê và báo cáo của hệ thống cũ hiện chưa được chuyển đầy đủ
          sang ứng dụng mới. Trang này chưa tương đương chức năng tại đường dẫn
          legacy <code className="font-mono text-sm">/statistic</code>.
        </p>
      </div>
    </section>
  );
}
