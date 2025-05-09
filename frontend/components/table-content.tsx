import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "./ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination"

import Image from 'next/image';
  
  const invoices = [
    {
      invoice: "INV001",
      topic: "พนัน 888",
      date: "02 พ.ค. 2568",
      notice: "แจ้งระงับการทำให้แพราหลายซึ่ข้อมูลคอมพิวเตอร์",
      type: "งานระงับการแพร่หลายซึ่งข้อมูลคอมพิวเตอร์ซึ่งมีความผิดตาม พ.ร.บ.",
      submit: 0
    },
    {
      invoice: "INV002",
      topic: "พนัน 888",
      date: "02 พ.ค. 2568",
      notice: "แจ้งระงับการทำให้แพราหลายซึ่ข้อมูลคอมพิวเตอร์",
      type: "งานระงับการแพร่หลายซึ่งข้อมูลคอมพิวเตอร์ซึ่งมีความผิดตาม พ.ร.บ.",
      submit: 0
    },
    {
      invoice: "INV003",
      topic: "พนัน 888",
      date: "02 พ.ค. 2568",
      notice: "แจ้งระงับการทำให้แพราหลายซึ่ข้อมูลคอมพิวเตอร์",
      type: "งานระงับการแพร่หลายซึ่งข้อมูลคอมพิวเตอร์ซึ่งมีความผิดตาม พ.ร.บ.",
      submit: 0
    },
    {
      invoice: "INV004",
      topic: "พนัน 888",
      date: "02 พ.ค. 2568",
      notice: "แจ้งระงับการทำให้แพราหลายซึ่ข้อมูลคอมพิวเตอร์",
      type: "งานระงับการแพร่หลายซึ่งข้อมูลคอมพิวเตอร์ซึ่งมีความผิดตาม พ.ร.บ.",
      submit: 1
    },
    {
      invoice: "INV005",
      topic: "พนัน 888",
      date: "02 พ.ค. 2568",
      notice: "แจ้งระงับการทำให้แพราหลายซึ่ข้อมูลคอมพิวเตอร์",
      type: "งานระงับการแพร่หลายซึ่งข้อมูลคอมพิวเตอร์ซึ่งมีความผิดตาม พ.ร.บ.",
      submit: 1
    },
    {
      invoice: "INV006",
      topic: "พนัน 888",
      date: "02 พ.ค. 2568",
      notice: "แจ้งระงับการทำให้แพราหลายซึ่ข้อมูลคอมพิวเตอร์",
      type: "งานระงับการแพร่หลายซึ่งข้อมูลคอมพิวเตอร์ซึ่งมีความผิดตาม พ.ร.บ.",
      submit: 1
    },
    {
      invoice: "INV007",
      topic: "พนัน 888",
      date: "02 พ.ค. 2568",
      notice: "แจ้งระงับการทำให้แพราหลายซึ่ข้อมูลคอมพิวเตอร์",
      type: "งานระงับการแพร่หลายซึ่งข้อมูลคอมพิวเตอร์ซึ่งมีความผิดตาม พ.ร.บ.",
      submit: 1
    },
  ]
  
  export function TableContent() {
    return (
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Actions</TableHead>
            <TableHead className="w-[150px]">Name</TableHead>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Notice</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Submit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">
                <div className="flex justify-between cursor-pointer">
                    <div>
                        <Image
                            src="/images/icons/delete.png"  // relative to the `public/` folder
                            alt="App logo"
                            width={24}
                            height={24}
                            priority  // optional: load immediately
                            />
                    </div>
                    <div>
                        <Image
                            src="/images/icons/pencil.png"  // relative to the `public/` folder
                            alt="App logo"
                            width={24}
                            height={24}
                            priority  // optional: load immediately
                            />
                    </div>
                </div>
              </TableCell>
              <TableCell>{invoice.topic}</TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>{invoice.notice}</TableCell>
              <TableCell>{invoice.type}</TableCell>
              <TableCell className="text-center text-background flex flex-col cursor-pointer">
                <div className={`py-2
                    rounded-md ${invoice.submit === 0? "bg-gray-500": "bg-blue-600"}`}>
                    <div>
                        {invoice.submit === 0? "บันทึกฉบับร่าง": "ส่งให้ ISP ดำเนินการ"}
                    </div>
                </div>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
                <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                            <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#" isActive>
                                2
                            </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
  }
  