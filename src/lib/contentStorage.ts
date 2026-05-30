export async function getStoredContent() {
  const res = await fetch('/api/content');
  return res.json();
}

export async function saveStoredContent(content: string[]) {
  await fetch('/api/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
}