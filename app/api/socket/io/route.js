// Socket.IO handlers removed for serverless deployments.
// Deploy a separate socket server (see `socket-server/`) and set
// `NEXT_PUBLIC_SOCKET_URL` in your environment to connect clients.

export async function GET() {
  return new Response('Socket.IO handlers disabled in this deployment. Use a separate socket server.', { status: 410 });
}

export async function POST() {
  return new Response('Socket.IO handlers disabled in this deployment. Use a separate socket server.', { status: 410 });
}

export const config = { api: { bodyParser: false } };
