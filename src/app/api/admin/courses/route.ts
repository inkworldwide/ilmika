import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import {
  getStreamsConfig,
  updateStreamVisibility,
  addStreamConfig,
  deleteStreamConfig,
  restoreStreamConfig,
  permanentDeleteStreamConfig,
  addBranchToStreamConfig,
  deleteBranchFromStreamConfig,
} from "@/lib/coursesConfig";

export async function GET(req: Request) {
  try {
    const streams = getStreamsConfig();
    return NextResponse.json({ streams });
  } catch (error) {
    console.error("Admin courses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isVisible, isFeaturedHome, action, branchName } = body;

    if (!id) {
      return NextResponse.json({ error: "Stream ID required" }, { status: 400 });
    }

    if (action === "addBranch") {
      if (!branchName) return NextResponse.json({ error: "Branch name required" }, { status: 400 });
      const updated = addBranchToStreamConfig(id, branchName);
      if (!updated) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
      return NextResponse.json({ message: "Branch added successfully", stream: updated });
    }

    if (action === "deleteBranch") {
      if (!branchName) return NextResponse.json({ error: "Branch name required" }, { status: 400 });
      const updated = deleteBranchFromStreamConfig(id, branchName);
      if (!updated) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
      return NextResponse.json({ message: "Branch removed successfully", stream: updated });
    }

    if (action === "restore") {
      const restored = restoreStreamConfig(id);
      if (!restored) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
      return NextResponse.json({ message: "Stream restored successfully" });
    }

    if (action === "delete") {
      const deleted = deleteStreamConfig(id);
      if (!deleted) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
      return NextResponse.json({ message: "Stream archived/deleted successfully" });
    }

    if (action === "permanentDelete") {
      const deleted = permanentDeleteStreamConfig(id);
      if (!deleted) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
      return NextResponse.json({ message: "Stream permanently deleted" });
    }

    const updated = updateStreamVisibility(id, isVisible, isFeaturedHome);
    if (!updated) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Stream configuration updated", stream: updated });
  } catch (error) {
    console.error("Admin course update error:", error);
    return NextResponse.json({ error: "Failed to update course configuration" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, degreeType, branches } = body;

    if (!name) {
      return NextResponse.json({ error: "Stream name required" }, { status: 400 });
    }

    const created = addStreamConfig({ name, description, degreeType, branches });
    return NextResponse.json({ message: "New stream created successfully", stream: created });
  } catch (error) {
    console.error("Admin course create error:", error);
    return NextResponse.json({ error: "Failed to create new stream" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

    if (!id) {
      return NextResponse.json({ error: "Stream ID required" }, { status: 400 });
    }

    if (permanent) {
      const deleted = permanentDeleteStreamConfig(id);
      if (!deleted) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
      return NextResponse.json({ message: "Stream permanently deleted" });
    }

    const deleted = deleteStreamConfig(id);
    if (!deleted) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Stream archived/deleted successfully" });
  } catch (error) {
    console.error("Admin course delete error:", error);
    return NextResponse.json({ error: "Failed to delete stream" }, { status: 500 });
  }
}
