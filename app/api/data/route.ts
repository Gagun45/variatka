import { NextRequest, NextResponse } from "next/server";
import {
  availableCollections,
  collectionLoaders,
  getDataSession,
} from "@/lib/data/server";
import { collectionKeys, type Collection } from "@/lib/data/collections";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  const collection = request.nextUrl.searchParams.get("collection");
  if (!collection || !Object.hasOwn(collectionKeys, collection)) {
    return NextResponse.json(
      { message: "Unknown collection" },
      { status: 400, headers },
    );
  }
  const session = await getDataSession();
  if (!availableCollections(session).includes(collection as Collection)) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: session?.user ? 403 : 401, headers },
    );
  }
  try {
    const data = await collectionLoaders(session)[collection as Collection]();
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error(`Failed to read ${collection}:`, error);
    return NextResponse.json(
      { message: "Could not load data" },
      { status: 500, headers },
    );
  }
}
