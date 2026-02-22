/**
 * Service untuk mengambil data wilayah Indonesia
 * Menggunakan API dari https://www.emsifa.com/api-wilayah-indonesia/
 */

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export const fetchProvinces = async () => {
  try {
    const res = await fetch(`${BASE_URL}/provinces.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch provinces:', err);
    return [];
  }
};

export const fetchRegencies = async (provinceId: string) => {
  if (!provinceId) return [];
  try {
    const res = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch regencies for province ${provinceId}:`, err);
    return [];
  }
};

export const fetchDistricts = async (regencyId: string) => {
  if (!regencyId) return [];
  try {
    const res = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch districts for regency ${regencyId}:`, err);
    return [];
  }
};

export const fetchVillages = async (districtId: string) => {
  if (!districtId) return [];
  try {
    const res = await fetch(`${BASE_URL}/villages/${districtId}.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch villages for district ${districtId}:`, err);
    return [];
  }
};
