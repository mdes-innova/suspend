import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class LogError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 601) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function Date2Thai(date: string) {
  const newDate = new Date(date);
  return Text2Thai(new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(newDate));
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
  }).format(newDate)).toString();
}

export function Text2Thai(text: string) {
  const digitsMap = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return text.replace(/\d/g, (d) => digitsMap[parseInt(d)]);
}