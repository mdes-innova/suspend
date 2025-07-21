import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import DataTable from '@/components/main/content';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PlaylistDialog from '@/components/main/playlist-dialog';
import { NewPlaylistSheet } from '@/components/main/new-playlist-sheet';
import { getContent } from '@/components/actions/document';
import { AuthError } from '@/components/exceptions/auth';

async function getData() {
  try {
    const data = await getContent();
    // const data = await fetchWithAccessApp({
    //   access, refresh, url, method: 'GET'
    // });
    // const data: any = await axios.get(url);
    // const orderIds = data.data.map((e: any) => e?.order_id).filter((x: any) => x);
    // const documents = orderIds.map((e: string) => {
    //   const filteredData: any[] = data.data.filter((x: any) => x.orderId === e);
    //   return (
    //     {
    //       orderId: e,
    //       groupId: filteredData.length? Object.keys(filteredData[0]).includes('group_id')? filteredData[0]['group_id']: null: null,
    //       groupName: filteredData.length? Object.keys(filteredData[0]).includes('group_name')? filteredData[0]['group_name']: null: null,
    //       createdDate: filteredData.length? Object.keys(filteredData[0]).includes('creatdate')? filteredData[0]['creatdate']: null: null,
    //       orderNo: filteredData.length? Object.keys(filteredData[0]).includes('order_no')? filteredData[0]['order_no']: null: null,
    //       courtOrder: filteredData.length? Object.keys(filteredData[0]).includes('court_order')? filteredData[0]['court_order']: null: null,
    //       orderDate: filteredData.length? Object.keys(filteredData[0]).includes('order_date')? filteredData[0]['order_date']: null: null,
    //       orderredNo: filteredData.length? Object.keys(filteredData[0]).includes('orderred_no')? filteredData[0]['orderred_no']: null: null,
    //       orderredDate: filteredData.length? Object.keys(filteredData[0]).includes('orderred_date')? filteredData[0]['orderred_date']: null: null,
    //     }
    //   );
      // group_id: data.data.filter((x: any) => x.order_id === e);
      // caselist_id: data.data.filter((x: any))
    // });
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function Content() {
  const data = await getData();
  return (
    <div className='w-full h-full flex flex-col px-2'>
      <DataTable data={data}/>
    </div>
  );
}

export default function Home() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <Content />
        <NewPlaylistSheet />
        <PlaylistDialog />
      </Suspense>
  );
}
