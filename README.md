# SEO Checker - ARMA AGENCY

A custom SEO checker page built with Next.js and Tailwind CSS, integrated with the SEOptimer API. This application provides a clean, user-friendly interface that matches the ARMA AGENCY website design.

## Features

- Custom design matching ARMA AGENCY branding (dark theme with red accents)
- Professional SEO audit tool using SEOptimer API
- Clean, user-friendly results layout
- Fully customizable parameter display
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- SEOptimer API key (get one at https://www.seoptimer.com/seo-api/)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

3. Add your SEOptimer API key to `.env.local`:
```
SEOPTIMER_API_KEY=your_actual_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The application uses the SEOptimer Report API which requires a two-step process:

1. **Create Report**: POST to `/v1/report/create` with the URL
2. **Get Report**: GET `/v1/report/get/{id}` to retrieve results (with automatic polling)

The API key is sent in the `x-api-key` header as per the [SEOptimer API documentation](https://documenter.getpostman.com/view/1513509/RWaC3CbQ).

## Customization

### Selecting Parameters to Display

To customize which parameters are displayed, edit the `src/app/api/check-seo/route.ts` file and modify the `selectedData` object (around line 141-147). You can add or remove parameters from the SEOptimer API response.

**Step-by-step guide:**

1. First, check the SEOptimer API response structure by temporarily logging it:
```typescript
const seoData = await seoptimerResponse.json()
console.log('Full API Response:', JSON.stringify(seoData, null, 2))
```

2. Check the actual API response structure in the server console logs after making a test request. The response structure will be logged.

3. Then, update the `selectedData` object with the parameters you want to display:
```typescript
const selectedData = {
  url: outputData?.url || reportData.data?.input?.url || url,
  reportId: reportId,
  // Add your custom parameters here based on the actual API response structure
  // The outputData contains the actual SEO audit results
  // Examples (adjust based on actual API structure):
  // title: outputData.title,
  // description: outputData.description,
  // score: outputData.score,
  // headings: outputData.headings,
  // metaKeywords: outputData.metaKeywords,
  // linksCount: outputData.links?.internal?.length,
  // imagesCount: outputData.images?.length,
  // pageLoadTime: outputData.performance?.pageLoadTime,
}
```

3. If you need to display nested data, you can extract and flatten it:
```typescript
const selectedData = {
  url: seoData.url,
  score: seoData.score,
  // Extract nested data
  internalLinks: seoData.links?.internal?.length || 0,
  externalLinks: seoData.links?.external?.length || 0,
  // etc.
}
```

4. The `ResultsDisplay` component will automatically render all properties in the `selectedData` object. For specific formatting, you can customize `src/components/ResultsDisplay.tsx`.

### Styling

The design uses Tailwind CSS with custom colors matching ARMA AGENCY branding. You can modify the theme in `tailwind.config.ts`:

- Primary colors: Dark backgrounds (`primary-dark`, `primary`)
- Accent color: Red (`accent`)

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── check-seo/
│   │   │       └── route.ts    # API route for SEOptimer integration
│   │   ├── globals.css         # Global styles with Tailwind
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main checker page
│   └── components/
│       ├── CheckerForm.tsx     # URL input form
│       └── ResultsDisplay.tsx  # Results display component
├── tailwind.config.ts          # Tailwind configuration
└── package.json
```

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

- `SEOPTIMER_API_KEY`: Your SEOptimer API key (required)

## License

Private - ARMA AGENCY

