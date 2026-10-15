import { Component, type ReactNode } from "react";
import { LoadError } from "@/components/ui/load-error";

/**
 * Galat saat render (mis. chunk halaman gagal dimuat) tidak boleh berakhir
 * dengan layar putih: tampilkan pesan dengan tombol muat ulang.
 * `resetKey` (path) mengosongkan galat saat pemain pindah halaman.
 */
export class ErrorBoundary extends Component<
  { resetKey: string; title: string; description: string; children: ReactNode },
  { error: unknown; key: string }
> {
  state = { error: null as unknown, key: this.props.resetKey };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  static getDerivedStateFromProps(props: { resetKey: string }, state: { error: unknown; key: string }) {
    return props.resetKey === state.key ? null : { error: null, key: props.resetKey };
  }

  componentDidCatch(error: unknown) {
    console.error("[app] galat saat render", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-screen-sm px-4 py-8">
        <LoadError title={this.props.title} description={this.props.description} onRetry={() => window.location.reload()} />
      </div>
    );
  }
}
