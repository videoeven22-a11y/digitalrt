/**
 * Service untuk mengambil data wilayah Indonesia
 * Menggunakan API dari https://www.emsifa.com/api-wilayah-indonesia/
 */

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  name: string;
  province_id: string;
}

export interface District {
  id: string;
  name: string;
  regency_id: string;
}

export interface Village {
  id: string;
  name: string;
  district_id: string;
}

export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    const res = await fetch(`${BASE_URL}/provinces.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch provinces:', err);
    return [];
  }
};

export const fetchRegencies = async (provinceId: string): Promise<Regency[]> => {
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

export const fetchDistricts = async (regencyId: string): Promise<District[]> => {
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

export const fetchVillages = async (districtId: string): Promise<Village[]> => {
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
