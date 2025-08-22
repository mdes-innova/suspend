'use client';

export function Date2Thai(date: string) {
  const newDate = new Date(date);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(newDate);
}

export function Datetime2Thai(date: string) {
  const newDate = new Date(date);
  return (new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(newDate)).toString();
}

export function Text2Thai(text: string) {
  const digitsMap = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return text.replace(/\d/g, (d) => digitsMap[parseInt(d)]);
}