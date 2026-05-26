import ChatWidget from "../components/ChatWidget";

export default function Home() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to AeroMind!</h1>
      <p>The chat widget is floating at the bottom right.</p>
      
      {/* The floating AI Chat Widget */}
      <ChatWidget />
    </main>
  );
}
