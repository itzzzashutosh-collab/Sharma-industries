/**
 * Social Media Marketing & Posting Agent — Subordinate Marketing Layer
 * Sharma Industries
 * 
 * Hierarchy:
 *   1. Ashutosh Sharma (Owner / CEO)
 *   2. Hermes Agent (Chief of Staff & Master Orchestrator)
 *   3. Social Media Marketing Agent (Subordinate Campaign & Content Engine)
 */

const fs = require('fs');
const path = require('path');
const hermesBridge = require('./hermes-bridge');
const primeResearch = require('./prime-research-controller');

const POSTS_DIR = path.join(__dirname, 'data', 'social_posts');
const REGISTRY_FILE = path.join(POSTS_DIR, 'index.json');

function initStorage() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(REGISTRY_FILE)) {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

const PLATFORM_SPECS = {
  instagram: {
    name: 'Instagram',
    tone: 'Visual, punchy, high-engagement, vibrant Hinglish with emojis & hashtags',
    hasMediaPrompt: true
  },
  whatsapp_status: {
    name: 'WhatsApp Status / Broadcast',
    tone: 'Direct, personal, conversational Hindi/Hinglish for dealers, painters & retailers',
    hasMediaPrompt: false
  },
  facebook: {
    name: 'Facebook Page & Groups',
    tone: 'Community-oriented, trust-building, technical durability stories & testimonials',
    hasMediaPrompt: true
  },
  linkedin: {
    name: 'LinkedIn B2B',
    tone: 'Corporate, high-margin manufacturing excellence, dealer franchise invitation',
    hasMediaPrompt: false
  }
};

// Official product catalog will be provided directly by CEO Ashutosh Sharma
const SHARMA_PRODUCTS = {};


class SocialMarketingController {
  constructor() {
    this.name = 'SocialMarketingAgent';
    initStorage();
  }

  listPosts(filterStatus = null) {
    initStorage();
    try {
      const all = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
      if (filterStatus) {
        return all.filter(p => p.status === filterStatus);
      }
      return all;
    } catch (e) {
      return [];
    }
  }

  getPost(id) {
    initStorage();
    const all = this.listPosts();
    const item = all.find(p => p.id === id);
    if (!item) return null;
    const file = path.join(POSTS_DIR, `${item.id}.json`);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    return item;
  }

  updatePostStatus(id, newStatus) {
    initStorage();
    const all = this.listPosts();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return null;

    all[idx].status = newStatus;
    all[idx].updatedAt = new Date().toISOString();

    const file = path.join(POSTS_DIR, `${id}.json`);
    if (fs.existsSync(file)) {
      const full = JSON.parse(fs.readFileSync(file, 'utf-8'));
      full.status = newStatus;
      full.updatedAt = new Date().toISOString();
      fs.writeFileSync(file, JSON.stringify(full, null, 2), 'utf-8');
    }

    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(all, null, 2), 'utf-8');
    return all[idx];
  }

  /**
   * Generate High-Impact Social Media Post
   */
  async generatePost({
    platform = 'instagram',
    theme = 'company_branding',
    product = 'Sharma Industries',
    customNotes = '',
    useCompetitorIntel = false
  }) {
    initStorage();
    const postId = `SOC-${Date.now().toString(36).toUpperCase()}`;
    const plat = PLATFORM_SPECS[platform] || PLATFORM_SPECS.instagram;
    const productInfo = SHARMA_PRODUCTS[product] || product || 'Sharma Industries';

    console.log(`[Social Marketing Agent] Generating ${plat.name} post for ${product} (Theme: ${theme})...`);

    let competitorContext = '';
    if (useCompetitorIntel || theme === 'competitor_comparison') {
      competitorContext = `
Use Direct Factory Advantage:
- Sharma Industries gives dealers Tier 1 18% margin (compared to MNCs offering only 8-12%).
- Direct factory pricing and regional dispatch advantage.`;
    }

    const prompt = `You are the Social Media Marketing & Content Director for Sharma Industries (Paints & Coatings Manufacturer, Rajasthan, India), operating under Hermes Master Orchestrator.

Your Objective:
Create an irresistible, high-converting social media marketing post tailored specifically for ${plat.name}.

Parameters:
- Platform: ${plat.name}
- Tone: ${plat.tone}
- Primary Focus / Product: ${productInfo}
- Campaign Theme: ${theme}
${competitorContext}
${customNotes ? `- Custom Focus Notes: ${customNotes}` : ''}

Output Format:
1. 🎯 **Visual / Creative Direction**: Brief description of the image/video/poster to pair with this post (colors, headline on graphic, vibe).
2. ✍️ **Headline / Hook**: Stop-the-scroll opening line.
3. 📝 **Main Caption / Body Copy**: Natural Hinglish / English, benefit-driven, mentioning dealer margin or durability where applicable.
4. 🚀 **Call to Action (CTA)**: Clear action (e.g. "Call/WhatsApp +91 9079609627 for dealership & factory direct delivery").
5. #️⃣ **Hashtags**: 10-15 targeted hashtags for paints, interior design, home renovation, and Rajasthan/North India dealers.

Keep it crisp, professional, and commercially compelling.`;

    let generatedText;
    try {
      const res = await hermesBridge.askOmniRoute(prompt);
      generatedText = typeof res === 'string' ? res : (res?.text || String(res));
    } catch (err) {
      generatedText = `### Sharma Industries Quality Spotlight\n\n` +
        `**Hook**: Direct factory quality and uncompromised durability!\n\n` +
        `**Product**: ${productInfo}\n` +
        `**Dealer Advantage**: 18% Tier 1 margin.\n` +
        `**Call to Action**: Contact +91 9079609627 for dealership inquiries.\n\n` +
        `#SharmaIndustries #Manufacturing #PaintsRajasthan #DealersScheme`;
    }

    const postData = {
      id: postId,
      platform,
      platformName: plat.name,
      product,
      theme,
      content: generatedText,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const filePath = path.join(POSTS_DIR, `${postId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(postData, null, 2), 'utf-8');

    const all = this.listPosts();
    all.unshift({
      id: postId,
      platform,
      platformName: plat.name,
      theme,
      product,
      status: 'draft',
      createdAt: postData.createdAt,
      filePath
    });
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(all, null, 2), 'utf-8');

    console.log(`✅ [Social Marketing Agent] Post ${postId} drafted and stored.`);
    return postData;
  }

  /**
   * Weekly Content Calendar Template
   */
  getContentCalendar() {
    return [
      { day: 'Monday', theme: 'B2B Dealer Motivation & Margin Scheme (18% Tier 1)', platform: 'LinkedIn & WhatsApp Broadcast' },
      { day: 'Tuesday', theme: 'Factory Quality & High Coverage Focus', platform: 'Instagram & Facebook' },
      { day: 'Wednesday', theme: 'Painter / Contractor Loyalty & Sampling', platform: 'WhatsApp Status' },
      { day: 'Thursday', theme: 'Direct Factory Value Advantage', platform: 'Instagram Carousel' },
      { day: 'Friday', theme: 'Customer Transformation Showcase', platform: 'Facebook & Instagram Reels' },
      { day: 'Saturday', theme: 'Dealership Inquiry & Dispatch Highlights', platform: 'All Platforms' },
      { day: 'Sunday', theme: 'Color Inspiration & Trends', platform: 'Instagram' }
    ];
  }
}

module.exports = new SocialMarketingController();
