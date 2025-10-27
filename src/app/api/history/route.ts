import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/services/supabase";

type SnapshotPayload = {
  name: string;
  snapshot: unknown;
};

async function resolveUserId(request: NextRequest) {
  const supabaseSSR = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabaseSSR.auth.getUser();
  return user?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();
    const id = request.nextUrl.searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("calculations")
        .select("id, name, created_at, updated_at, data")
        .eq("user_id", userId)
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ item: data });
    }

    const { data, error } = await supabase
      .from("calculations")
      .select("id, name, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("GET /api/history error", error);
    return NextResponse.json(
      { error: "Failed to load history" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SnapshotPayload;
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!body?.name || !body?.snapshot) {
      return NextResponse.json(
        { error: "Missing name or snapshot" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("calculations")
      .insert([
        {
          user_id: userId,
          name: body.name,
          data: body.snapshot,
        },
      ])
      .select("id, name, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/history error", error);
    return NextResponse.json(
      { error: "Failed to save calculation" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as SnapshotPayload & { id?: string };
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!body?.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name;
    if (body.snapshot) updateData.data = body.snapshot;

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("calculations")
      .update(updateData)
      .eq("user_id", userId)
      .eq("id", body.id)
      .select("id, name, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("PATCH /api/history error", error);
    return NextResponse.json(
      { error: "Failed to update calculation" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from("calculations")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/history error", error);
    return NextResponse.json(
      { error: "Failed to delete calculation" },
      { status: 500 },
    );
  }
}

