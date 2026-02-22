import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    let url = '';
    
    switch (type) {
      case 'provinces':
        url = `${BASE_URL}/provinces.json`;
        break;
      case 'regencies':
        url = `${BASE_URL}/regencies/${id}.json`;
        break;
      case 'districts':
        url = `${BASE_URL}/districts/${id}.json`;
        break;
      case 'villages':
        url = `${BASE_URL}/villages/${id}.json`;
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid type parameter' 
        }, { status: 400 });
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch location data' 
    }, { status: 500 });
  }
}
