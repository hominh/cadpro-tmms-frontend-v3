export default function DashboardPage() {
  return (
    <section className="min-h-full px-6 py-12">
      <div className="mx-auto max-w-3xl" role="status">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Trạng thái chuyển đổi
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Bản đồ</h1>
        <p className="mt-3 text-slate-600">
          Mô-đun bản đồ của hệ thống cũ hiện chưa được chuyển sang ứng dụng mới.
          Trang này chỉ thông báo trạng thái và chưa thay thế chức năng tại đường dẫn
          legacy <code className="font-mono text-sm">/map</code>.
        </p>
      </div>
    </section>
  );
}
