export type Category = {
    name: string,
    createdAt: string
}

export type Document = {
  id: number, 
  pinned: boolean,
  download?: string,
  redNumber?: string,
  blackNumber?: string,
  section?: string,
  title: string,
  date: string,
  selected: boolean,
  downloads: string,
  active: boolean,
  category: Category
}

export type Group = {
    id: number,
    createdAt: string,
    name: string,
    documents: any[]
}