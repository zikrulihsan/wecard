export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
