// Socket endpoints disabled for Vercel serverless environment.
// If you need real-time features, deploy a separate Socket.IO server
// (see `socket-server/` or VERSEL_DEPLOYMENT_GUIDE.md) and point
// clients to that host using NEXT_PUBLIC_SOCKET_URL.

export async function GET() {
  return new Response('Socket endpoints are disabled in this deployment. Use a separate socket server.', { status: 410 });
}
