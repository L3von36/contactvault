<div align="center">
  <img src="public/logo.png" width="120" height="120" alt="ContactVault Logo" />
  <h1>ContactVault</h1>
  <p><b>Zero-Trust Privacy. State-of-the-Art Security.</b></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-Styling-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

---

![ContactVault Hero](public/screenshots/hero.png)

## 🛡️ The Zero-Trust Contact Protocol

ContactVault is a premium contact management system built for those who prioritize privacy and security above all else. Unlike traditional contact apps, ContactVault treats every data point as a secure asset protected by high-standard encryption and strict access protocols.

### ✨ Key Features

- **🔐 Secure Sharing Protocol**: Generate unique, time-limited access tokens for your contacts. Share via secure URLs or instant-scan QR codes.
- **🚨 Duress Mode**: A fail-safe protocol that hides sensitive information behind a secure PIN. If compromised, initialize a "Nuclear Reset" to wipe all data instantly.
- **🌐 Shared with Me**: seamlessly import shared contacts into your own secure vault with one click.
- **🏷️ Relationship Mapping**: Organize your network with dynamic relationship categories and visual intelligence.
- **⚡ High-Performance Dashboard**: A sleek, dark-mode-first interface optimized for speed and clarity.
- **📤 Data Portability**: Import from CSV/VCF and export your entire vault whenever you need it.

---

### 📸 Visual Intelligence

<table border="0">
  <tr>
    <td width="50%">
      <b>Secure Sharing</b><br/>
      Generate QR codes for instant, authenticated sharing between vaults.
      <img src="public/screenshots/sharing.png" width="100%" />
    </td>
    <td width="50%">
      <b>Duress Protocol</b><br/>
      Hide or purge your data instantly when security is compromised.
      <img src="public/screenshots/duress.png" width="100%" />
    </td>
  </tr>
</table>

---

### 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Security**: Supabase Auth + custom RLS Policies
- **Styling**: Tailwind CSS + Framer Motion (Animations)
- **Icons**: Lucide React
- **Verification**: Jest + React Testing Library (40+ Tests)

---

### 🚀 Getting Started

1. **Clone the Vault**
   ```bash
   git clone https://github.com/your-repo/contactvault.git
   cd contactvault
   ```

2. **Initialize Environment**
   Create a `.env.local` file with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

3. **Deploy Database**
   Run the scripts in `migrations/` to set up RLS policies and table structures.

4. **Initialize Protocol**
   ```bash
   npm install
   npm run dev
   ```

---

<div align="center">
  <p>Built with ❤️ for Privacy Enthusiasts</p>
  <img src="public/screenshots/hero.png" width="200" style="opacity: 0.3" />
</div>
