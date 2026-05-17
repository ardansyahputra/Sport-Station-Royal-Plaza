const STORAGE_KEY = 'sportstation-settings';

const STORAGE_URL = '/api/settings';

export type SettingsData = {
  name: string;
  email: string;
  password: string;
};

/* =====================================================
   GET SETTINGS
===================================================== */

export async function getStoredSettings(): Promise<SettingsData> {
  try {
    const response = await fetch(STORAGE_URL, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed fetch');
    }

    const data = await response.json();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error(error);

    const local = localStorage.getItem(STORAGE_KEY);

    if (local) {
      return JSON.parse(local);
    }

    return {
      name: '',
      email: '',
      password: '',
    };
  }
}

/* =====================================================
   SAVE SETTINGS
===================================================== */

export async function saveStoredSettings(settings: SettingsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    await fetch(STORAGE_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error(error);
  }
}
