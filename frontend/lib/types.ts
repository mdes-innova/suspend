export type Category = {
    name: string,
    createdAt: string
}

export type Document = {
  id: number, 
  kindId?: number,
  kindName?: string,
  orderId: number,
  orderNo?: string,
  orderList?: string,
  orderDate?: string,
  orderFilename?: string,
  orderredNo?: string,
  orderredDate?: string,
  orderblackNo?: string,
  orderblackDate?: string,
  ispNo?: string,
  ispDate?: string,
  active?: boolean,
  groupName?: string,
  groupId?: number,
  documentFile?: DocumentFile,
  hasAllIsps?: boolean
}

export type Group = {
    id: number,
    createdAt: string,
    modifiedAt: string,
    name: string,
    documents: Document[],
    user: User,
    title: string,
    documentNo: string,
    documentDate?: string,
    speed?: number,
    secret?: number,
    groupFiles?: GroupFile[],
    section?: Section,
}

export type User = {
  id: number,
  username?: string,
  isStaff: boolean,
  isActive: boolean,
  isSuperuser: boolean,
  isp?: Isp,
  email?: string,
  thaiid?: boolean,
  givenName?: string,
  familyName?: string,
  birthdate?: string
};

export type File = {
  id: number,
  name: string,
  red: string,
  black: string,
  date: string
}

export type Kind = {
  kindId: number,
  name: string
}

export type Isp = {
  id: number,
  name: string,
  ispId: number,
  mailCount: number,
  createdAt?: string,
  documents?: number[]
}

export type UserRegister = {
  username?: string,
  password?: string,
  email?: string,
  ispId?: number
}

export type IspFile = {
  id: number,
  user: User,
  file: Blob,
  createdAt: string
}

export type Mail = {
  id: number,
  isp: Isp,
  subject: string,
  datetime?: string,
  receiver: User,
  sender: User,
  group?: Group,
  mailFiles: MailFile[],
  createdAt: string,
  confirmed?: boolean,
  confirmedHash?: string,
  documentNo: string,
  documentDate?: string,
  speed?: number,
  secret?: number,
  confirmedDate?: string,
  status: string,
  documents?: Document[]
}

export type MailFile = {
  id?: number,
  originalFilename: string,
  isp: Isp,
  mail: number,
  createdAt: string
}

export type GroupFile = {
  id?: number,
  isp?: Isp,
  group?: Group,
  file?: Blob,
  originalFilename?: string,
  size: number,
  allIsp?: boolean
}

export type StaffMail = {
  id?: number,
  mailGroupId: string,
  createdAt: string,
  documentNo: string,
  numDocuments: number,
  sends: string,
  confirms: string
}

export type MailGroup = {
  id?: number,
  documentNo: string,
  documentDate: string,
  speed: number,
  secret: number,
  subject: string,
  mails: Mail[],
  documents: Document[],
  section: Section,
  allispMailFiles?: MailFile[],
  user?: User
}

export type GroupUpdate = {
    name?: string,
    title?: string,
    documentNo?: string,
    documentDate?: string | null,
    speed?: number | null,
    secret?: number | null,
    section?: number | null,
    body?: string
}

export type DocumentFile = {
  id: number,
  originalFilename: string,
  size: number,
  uploadedAt: string
}

export type GroupFileTable = {
  isp: Isp,
  groupFiles: GroupFile[],
  size: number
}

export type Section = {
  id: number,
  name: string,
  createdAt: string
}