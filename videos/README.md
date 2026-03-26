# Motion Graphics Videos

Drop your motion graphics video files here.

## How to add a video to a project

1. Place your `.mp4` file in this folder (e.g. `msa-pepper-ad.mp4`)
2. Open `src/hooks/use-portfolio.ts`
3. Find the matching project (e.g. `motion-1`)
4. Add the `video` field:

```ts
{
  id: "motion-1",
  title: "MSA Special Pepper – Product Ad",
  category: "Motion Graphics",
  ...
  video: "/videos/msa-pepper-ad.mp4",   // ← add this line
}
```

The project card will automatically show a video player instead of an image.

## Recommended formats
- **Format:** MP4 (H.264) — best browser support
- **Resolution:** 1080p or 720p
- **Max size:** keep under 50 MB for fast loading
