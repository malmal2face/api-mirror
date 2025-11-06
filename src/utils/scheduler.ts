export function startAutoSync(intervalMinutes: number = 1) {
  const intervalMs = intervalMinutes * 60 * 1000;

  const syncData = async () => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-cricket-data`;

      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Auto-sync completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };

  syncData();

  return setInterval(syncData, intervalMs);
}

export function stopAutoSync(intervalId: number) {
  clearInterval(intervalId);
}
