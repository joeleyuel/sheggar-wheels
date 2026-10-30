import {seedUsers,seedCars,seedBookings,seedReviews,seedDisputes,seedAnnouncements} from "./seed";
const KEYS = {users:"sw_users_v2",cars:"sw_cars_v2",bookings:"sw_bookings_v2",reviews:"sw_reviews_v2",disputes:"sw_disputes_v2",announcements:"sw_announcements_v2"};
export function readJSON(key,fallback){try{const raw=localStorage.getItem(key);if(!raw)return fallback;const parsed=JSON.parse(raw);return parsed ?? fallback;}catch{return fallback;}}
export function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function initializeDemoData(){
 const seeds={users:seedUsers,cars:seedCars,bookings:seedBookings,reviews:seedReviews,disputes:seedDisputes,announcements:seedAnnouncements};
 Object.entries(seeds).forEach(([name,value])=>{if(localStorage.getItem(KEYS[name])===null)writeJSON(KEYS[name],value);});
}
export function getData(name){return readJSON(KEYS[name],[]);}
export function saveData(name,value){return writeJSON(KEYS[name],value);}
export function getSession(){try{return JSON.parse(sessionStorage.getItem("sw_session_v1")||"null");}catch{return null;}}
export function setSession(userId){sessionStorage.setItem("sw_session_v1",JSON.stringify({userId,signedInAt:new Date().toISOString()}));}
export function clearSession(){sessionStorage.removeItem("sw_session_v1");sessionStorage.removeItem("sw_checkout_draft_v1");}
export function makeId(prefix="id"){return `${prefix}-${typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)}`;}
export function resetDemoData(){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));initializeDemoData();}
export function exportCSV(filename,rows){
 if(!rows.length)return false;
 const headers=Object.keys(rows[0]);
 const quote=v=>`"${String(v??"").replace(/"/g,'""')}"`;
 const csv=[headers.map(quote).join(","),...rows.map(row=>headers.map(h=>quote(row[h])).join(","))].join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);return true;
}
