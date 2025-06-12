'use client';

import { memo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { usePathname } from "next/navigation";

export type Paginor = {
  active: number
  count: number
}

export const MyPagination = memo(({ pagination }: { pagination: Paginor }) => {
  const numPerPage = 20;
  const numPage = Math.ceil(pagination.count / numPerPage)
  const pathname = usePathname();

  let pageArr;
  let pageSkip = [-1, -1]

  if (numPage < 11)
  {
    pageArr = Array.from({length: numPage}).map((elem, index) => index)
  }
  else
  {
    if (pagination.active < 4)
    {
      pageArr = [0, 1, 2, 3, 4, 5, numPage - 2, numPage -1]
      pageSkip = [5, -1]
    }
    else if (pagination.active > numPage - 5)
    {
      pageArr = [0, 1, numPage - 6, numPage - 5, numPage - 4, numPage - 3, numPage - 2, numPage - 1]
      pageSkip = [-1, numPage - 6]
    }
    else
    {
      pageArr = [0]
      pageArr.push(...Array.from({length: 7}).map((_, index) => (pagination.active + (index - 3))))
      pageArr.push(numPage - 1)
      pageSkip = [pagination.active - 3, pagination.active + 3]
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`${pathname}?ap=${pagination.active > 0? pagination.active - 1: 0}`} />
        </PaginationItem>
        {
        pageArr.map((elem, idx) => 
        {
          if (elem == pagination.active)
          {
            return (
                  <PaginationItem key={`page-${idx}`}>
                    <PaginationLink href={`${pathname}?ap=${elem}`} isActive>{elem + 1}</PaginationLink>
                  </PaginationItem>
              )
          }
          else if (pageSkip.includes(elem))
          {
            return (
              <PaginationItem key={`page-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            
              );
          }
          else
          {
            return (
                  <PaginationItem key={`page-${idx}`}>
                    <PaginationLink href={`${pathname}?ap=${elem}`}>{elem + 1}</PaginationLink>
                  </PaginationItem>
              );
          }
        })
        }
        <PaginationItem>
          <PaginationNext
            href={`${pathname}?ap=${pagination.active < numPage - 1? pagination.active + 1: numPage - 1}`} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
});