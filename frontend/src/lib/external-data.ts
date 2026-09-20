import type { RuntimeConfig } from "@/lib/runtime-config";

export interface DriveImage {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

export type SheetRow = Record<string, string>;

export interface GoogleReview {
  authorName: string;
  authorUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface GooglePlaceReviews {
  name: string;
  rating?: number;
  totalRatings?: number;
  url?: string;
  reviews: GoogleReview[];
}

export async function listDriveImages(apiKey: string, folderId: string): Promise<DriveImage[]> {
  const query = `'${folderId.replaceAll("'", "\\'")}' in parents and trashed = false and mimeType contains 'image/'`;
  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    spaces: "drive",
    pageSize: "100",
    orderBy: "name_natural",
    fields: "files(id,name,mimeType,modifiedTime)",
  });
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
  if (!response.ok) throw new Error(`Google Drive returned ${response.status}`);
  const body = (await response.json()) as { files?: DriveImage[] };
  return body.files ?? [];
}

export const driveImageUrl = (id: string) =>
  `https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`;

function parseCsv(input: string): string[][] {
  const source = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (quoted && character === '"' && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
  }
  return rows;
}

const normalizeHeading = (heading: string) =>
  heading.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export async function loadPublishedSheet(csvUrl: string): Promise<SheetRow[]> {
  const response = await fetch(csvUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Published Google Sheet returned ${response.status}`);
  const rows = parseCsv(await response.text());
  const headings = (rows.shift() ?? []).map(normalizeHeading);
  return rows.map((values) =>
    Object.fromEntries(headings.map((heading, index) => [heading, values[index]?.trim() ?? ""])),
  );
}

export const readSheetValue = (row: SheetRow, ...headings: string[]) => {
  for (const heading of headings) {
    const value = row[normalizeHeading(heading)];
    if (value) return value;
  }
  return "—";
};

type PlacesReviewResult = {
  author_name?: string;
  author_url?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
};

type PlaceResult = {
  name?: string;
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  reviews?: PlacesReviewResult[];
};

type PlacesService = {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (place: PlaceResult | null, status: string) => void,
  ) => void;
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      places?: {
        PlacesService: new (element: HTMLElement) => PlacesService;
        PlacesServiceStatus: { OK: string };
      };
    };
  };
};

async function loadPlacesLibrary(apiKey: string) {
  const browser = window as GoogleMapsWindow;
  if (browser.google?.maps?.places) return browser.google.maps.places;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-gmca-google-places]");
    const script = existing ?? document.createElement("script");
    const timeout = window.setTimeout(() => reject(new Error("Google Places timed out")), 15000);
    const finish = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    const fail = () => {
      window.clearTimeout(timeout);
      reject(new Error("Google Places could not load"));
    };
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", fail, { once: true });
    if (!existing) {
      script.dataset.gmcaGooglePlaces = "true";
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key: apiKey, libraries: "places", v: "weekly", loading: "async" })}`;
      document.head.appendChild(script);
    }
  });

  const places = (window as GoogleMapsWindow).google?.maps?.places;
  if (!places) throw new Error("Google Places library is unavailable");
  return places;
}

export async function loadGoogleReviews(apiKey: string, placeId: string): Promise<GooglePlaceReviews> {
  const places = await loadPlacesLibrary(apiKey);
  const service = new places.PlacesService(document.createElement("div"));
  const place = await new Promise<PlaceResult>((resolve, reject) => {
    service.getDetails(
      { placeId, fields: ["name", "rating", "user_ratings_total", "reviews", "url"] },
      (result, status) => {
        if (status === places.PlacesServiceStatus.OK && result) resolve(result);
        else reject(new Error(`Google Places returned ${status}`));
      },
    );
  });
  return {
    name: place.name ?? "Genius Mind Chess Academy",
    rating: place.rating,
    totalRatings: place.user_ratings_total,
    url: place.url,
    reviews: (place.reviews ?? []).map((review) => ({
      authorName: review.author_name ?? "Google reviewer",
      authorUrl: review.author_url,
      rating: review.rating ?? 0,
      text: review.text ?? "",
      relativeTime: review.relative_time_description ?? "",
    })),
  };
}

export async function sendEnquiryViaCallMeBot(
  config: RuntimeConfig["callMeBot"],
  enquiry: { name: string; phone: string; program: string; message: string },
) {
  const text = [
    "New GMCA website enquiry",
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Program: ${enquiry.program}`,
    `Message: ${enquiry.message}`,
  ].join("\n");
  const params = new URLSearchParams({ phone: config.phone, text, apikey: config.apiKey });
  await fetch(`https://api.callmebot.com/whatsapp.php?${params}`, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
  });
}

export function buildMapEmbedUrl(config: RuntimeConfig["googleMaps"]) {
  const query = config.placeId ? `place_id:${config.placeId}` : config.query;
  return `https://www.google.com/maps/embed/v1/place?${new URLSearchParams({ key: config.embedApiKey, q: query })}`;
}