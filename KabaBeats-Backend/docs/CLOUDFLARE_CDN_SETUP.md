# Cloudflare CDN Setup Guide for KabaBeats

## 🌟 Why Cloudflare?

- **100% Free tier** with generous limits
- **Global CDN** with 200+ data centers worldwide
- **Built-in caching** and optimization
- **DDoS protection** included
- **HLS streaming support** out of the box
- **Bandwidth**: Unlimited on free tier
- **Easy integration** with Cloudflare R2

## 🚀 Setup Options

### Option 1: Direct R2 URL (No Domain Required) ✅

#### Step 1: Set up Cloudflare R2
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Create a new bucket: `kababeat-media`
4. Note your **Account ID** and **Bucket Name**

#### Step 2: Get Your R2 URL
1. In your R2 bucket, go to **Settings** → **Public Access**
2. Enable **Public Access** if you want public files
3. Your R2 URL will be: `https://pub-{random-id}.r2.dev`
4. Or use the direct URL: `https://{bucket-name}.{account-id}.r2.cloudflarestorage.com`

#### Step 3: Update Environment Variables
```bash
# .env file - Use your actual R2 URL
CDN_BASE_URL=https://pub-{your-random-id}.r2.dev
# OR
CDN_BASE_URL=https://kababeat-media.{your-account-id}.r2.cloudflarestorage.com
CDN_PROVIDER=cloudflare
```

### Option 2: Custom Domain (Future Enhancement)

When you get a domain later:
1. In your R2 bucket settings, go to **Settings** → **Custom Domains**
2. Add a custom domain: `media.kababeat.kabax.ca`
3. Cloudflare will automatically provision SSL certificate
4. Update your environment variable:
```bash
CDN_BASE_URL=https://media.kababeat.kabax.ca
```

## 🔧 Configuration

### Current CDN Config (Already Set Up)
```typescript
const cdnConfig: CDNConfig = {
  provider: 'cloudflare',
  baseUrl: process.env.CDN_BASE_URL || 'https://media.kababeat.kabax.ca',
  cacheSettings: {
    defaultTTL: 3600,    // 1 hour
    maxTTL: 86400,       // 24 hours
    minTTL: 300,         // 5 minutes
  },
  streamingSettings: {
    enableHLS: true,
    enableDASH: false,
    segmentDuration: 10,
  },
};
```

## 📁 File Structure in R2

```
kababeat-media/
├── uploads/
│   ├── audio/
│   │   └── {userId}/
│   │       └── {beatId}/
│   │           ├── original.mp3
│   │           └── processed/
│   │               ├── preview.mp3
│   │               └── full.mp3
│   ├── images/
│   │   ├── profiles/
│   │   │   └── {userId}/
│   │   │       ├── avatar.jpg
│   │   │       └── thumbnails/
│   │   └── artwork/
│   │       └── {beatId}/
│   │           ├── cover.jpg
│   │           └── thumbnails/
│   └── chunks/
│       └── {sessionId}/
│           ├── chunk-001
│           ├── chunk-002
│           └── ...
└── processed/
    └── hls/
        └── {userId}/
            └── {beatId}/
                ├── master/
                │   └── playlist.m3u8
                ├── high/
                │   ├── playlist.m3u8
                │   ├── segment-001.ts
                │   └── segment-002.ts
                ├── medium/
                │   ├── playlist.m3u8
                │   ├── segment-001.ts
                │   └── segment-002.ts
                └── low/
                    ├── playlist.m3u8
                    ├── segment-001.ts
                    └── segment-002.ts
```

## 🎵 HLS Streaming URLs

### Generated URLs will look like:
```
# With R2 URL (no domain needed)
https://pub-{your-random-id}.r2.dev/processed/hls/{userId}/{beatId}/master/playlist.m3u8

# Quality-specific playlists
https://pub-{your-random-id}.r2.dev/processed/hls/{userId}/{beatId}/high/playlist.m3u8
https://pub-{your-random-id}.r2.dev/processed/hls/{userId}/{beatId}/medium/playlist.m3u8
https://pub-{your-random-id}.r2.dev/processed/hls/{userId}/{beatId}/low/playlist.m3u8

# When you get a domain later:
https://media.kababeat.kabax.ca/processed/hls/{userId}/{beatId}/master/playlist.m3u8
```

## 🔄 Cache Headers

The CDN automatically sets appropriate cache headers:

- **Audio files**: 24 hours cache
- **Images**: 24 hours cache
- **HLS playlists**: 1 hour cache
- **Static assets**: 24 hours cache

## 🚀 Performance Benefits

### With Cloudflare CDN:
- **Global edge caching** - files served from nearest location
- **Automatic compression** - Gzip/Brotli compression
- **HTTP/2 & HTTP/3** support
- **DDoS protection** - built-in security
- **Analytics** - detailed usage statistics

### Expected Performance:
- **First load**: ~200-500ms (depending on file size)
- **Cached requests**: ~50-100ms
- **Global availability**: 99.9% uptime
- **Bandwidth**: Unlimited on free tier

## 🔧 Advanced Configuration

### Custom Cache Rules (Optional)
You can create custom cache rules in Cloudflare dashboard:

1. Go to **Caching** → **Configuration**
2. Create **Page Rules** for specific file types:

```
# Audio files - longer cache
URL: media.kababeat.kabax.ca/uploads/audio/*
Settings: Cache Level = Cache Everything, Edge TTL = 1 month

# HLS files - shorter cache
URL: media.kababeat.kabax.ca/processed/hls/*
Settings: Cache Level = Cache Everything, Edge TTL = 1 hour
```

### Analytics & Monitoring
- **Cloudflare Analytics**: Built-in dashboard
- **Real User Monitoring**: Performance insights
- **Security Events**: DDoS and attack monitoring

## 💰 Cost Comparison

### Cloudflare (Free Tier):
- **Bandwidth**: Unlimited
- **Requests**: Unlimited
- **Storage**: R2 pricing (very low)
- **Total**: ~$0-5/month for small-medium usage

### Alternatives:
- **AWS CloudFront**: $0.085/GB + requests
- **BunnyCDN**: $0.01/GB (very affordable)
- **KeyCDN**: $0.04/GB

## 🛠 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   ```typescript
   // Ensure CORS is configured in R2
   // Add to your R2 bucket CORS policy:
   {
     "AllowedOrigins": ["https://kababeat.kabax.ca"],
     "AllowedMethods": ["GET", "HEAD"],
     "AllowedHeaders": ["*"]
   }
   ```

2. **Cache Not Updating**:
   ```typescript
   // Use the purge function
   await purgeCDNCache('uploads/audio/user123/beat456/original.mp3');
   ```

3. **HLS Not Playing**:
   - Check MIME types are correct
   - Ensure segments are properly generated
   - Verify playlist URLs are accessible

## 📊 Monitoring

### Key Metrics to Track:
- **Cache hit ratio** (should be >90%)
- **Bandwidth usage**
- **Request latency**
- **Error rates**

### Cloudflare Dashboard:
- **Analytics** → **Web Traffic**
- **Caching** → **Cache Analytics**
- **Security** → **Events**

## 🎯 Next Steps

1. **Set up Cloudflare account** and R2 bucket
2. **Get your R2 URL** (no domain needed!)
3. **Update environment variables** with your R2 URL
4. **Test file uploads** and streaming
5. **Monitor performance** and adjust cache settings
6. **Add custom domain later** when you get one

## 🚀 Quick Start (No Domain Required)

1. **Create Cloudflare R2 bucket**: `kababeat-media`
2. **Enable public access** in bucket settings
3. **Copy your R2 URL**: `https://pub-{random-id}.r2.dev`
4. **Update your .env**:
   ```bash
   CDN_BASE_URL=https://pub-{your-random-id}.r2.dev
   ```
5. **Start using it immediately!** 🎉

Your CDN configuration is already set up and ready to use with Cloudflare R2 - no domain required! 🚀
