# 💼 Portfolio Manager

> **Your Complete Financial Command Center**

A modern, intelligent portfolio management platform designed for Indian investors. Track your investments, analyze performance, plan your financial goals, and get AI-powered investment advice—all in one beautiful, intuitive interface.

---

## 🌟 Overview

Portfolio Manager is a comprehensive financial management solution that brings together portfolio tracking, performance analytics, goal planning, and AI-powered investment advisory. Built specifically for the Indian market with support for NSE, BSE, and real-time Zerodha integration.

Whether you're managing equity stocks, mutual funds, fixed deposits, or planning for retirement, Portfolio Manager gives you the tools and insights you need to make informed financial decisions.

---

## ✨ Key Features

### 📊 **Portfolio Dashboard**
- **Real-time Net Worth Tracking**: See your total portfolio value at a glance
- **Multi-Account Management**: Track equity, mutual funds, FDs, PPF, EPF, gold, and crypto
- **Performance Metrics**: Monitor gains, losses, and growth percentages across all accounts
- **Interactive Charts**: Visualize your portfolio performance over customizable time periods (1W, 1M, 3M, 6M, YTD, 1Y, 5Y, ALL)
- **Goal Tracking**: Set and monitor progress toward financial goals with visual progress bars

### 📈 **Performance Analytics**
- **Top 5 Performance Indicators**:
  - **Sharpe Ratio**: Risk-adjusted return measure
  - **Total Return**: Overall portfolio performance
  - **Annualized Return**: Year-over-year growth projection
  - **Volatility**: Risk assessment through standard deviation
  - **Max Drawdown**: Largest peak-to-trough decline analysis

- **6 Technical Indicators**:
  - **MACD**: Moving Average Convergence Divergence for trend analysis
  - **RSI**: Relative Strength Index for overbought/oversold signals
  - **Bollinger Bands**: Price volatility and momentum indicators
  - **Moving Averages**: 50/200-day MA with golden cross detection
  - **Beta**: Market correlation and volatility measurement
  - **Volume Trends**: Trading volume analysis

- **Benchmark Comparison**: Compare your portfolio against Nifty 50 and BSE Sensex
- **Dynamic Time Range Analysis**: Switch between different time periods with smooth animated transitions

### 💰 **Holdings Management**
- **Live Zerodha Sync**: Real-time synchronization with Zerodha trading platform
- **Comprehensive Holdings Table**: View all your positions with detailed metrics
- **Search & Filter**: Quickly find specific holdings
- **Daily/Total View**: Toggle between daily changes and total gain/loss
- **Sortable Columns**: Sort by position size, value, or performance
- **Indian Stock Focus**: Pre-configured with top Indian stocks (RELIANCE, TCS, INFY, HDFCBANK, etc.)

### 🎯 **Goal Planning**
- **Multiple Goal Types**: Emergency fund, home downpayment, car purchase, retirement, and more
- **Progress Tracking**: Visual progress bars showing completion percentage
- **Target vs Current**: Monitor how close you are to achieving each goal
- **Add/Delete Goals**: Flexible goal management

### 🤖 **AI Investment Advisor (FinAI)**
- **Conversational Interface**: Chat naturally with your AI investment advisor
- **SIP Planning**: Get personalized Systematic Investment Plan recommendations
- **Goal-Based Planning**: AI helps you plan for retirement, house, education, and other goals
- **Multi-language Support**: English, Hindi, and Marathi
- **Risk Assessment**: Get recommendations based on your risk tolerance
- **Debt Strategy**: Avalanche vs Snowball method analysis
- **Tax Optimization**: ELSS and Section 80C suggestions
- **Insurance Gap Analysis**: Identify coverage gaps in term and health insurance

### 🔄 **Data Management**
- **Add/Delete Accounts**: Easily manage your investment accounts
- **Real-time Updates**: Automatic recalculation of net worth and performance
- **Local Data Storage**: All your financial data stays on your device
- **Export Capabilities**: Export your portfolio data for external analysis

### 🎨 **User Experience**
- **Modern UI**: Beautiful, responsive design with dark mode support
- **Smooth Animations**: Polished transitions and interactions
- **Collapsible Sidebar**: Clean navigation with collapsible menu
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Intuitive Navigation**: Easy access to all features from the sidebar

---

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14+ with App Router
- **UI Library**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Lucide React

### Backend Services
- **Portfolio API**: Next.js API routes for portfolio data
- **Stock Data**: Alpha Vantage API integration for real-time quotes
- **FinAI Service**: FastAPI backend for investment advisory
- **Voice AI**: Flask-based voice assistant for screen analysis

### Data Sources
- **Stock Prices**: Alpha Vantage API (Indian stocks)
- **Trading Platform**: Zerodha integration for live sync
- **Benchmarks**: NSE Nifty 50 and BSE Sensex

---

## 🛠️ Technology Stack

### Core Technologies
- **Next.js**: React framework for production
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Hook Form**: Form management

### Financial Data
- **Alpha Vantage**: Real-time stock quotes and market data
- **Indian Market Focus**: NSE and BSE index tracking

### AI & Analytics
- **FinAI**: Custom investment advisory engine
- **Google Gemini**: LLM for conversational AI
- **Technical Analysis**: Built-in indicators and calculations

### Integration
- **Zerodha API**: Live portfolio synchronization
- **Google Sheets**: Data export and analysis
- **Screen Capture**: AI-powered screen analysis

---

## 📱 Key Pages

### Dashboard (`/dashboard/portfolio`)
- Overview of net worth, accounts, and saving goals
- Interactive performance graph with multiple time ranges
- Quick access to all portfolio features

### Holdings (`/dashboard/holdings`)
- Complete holdings table with all positions
- Live Zerodha sync status
- Search, filter, and sort capabilities
- Daily and total performance views

### Performance (`/dashboard/performance`)
- Comprehensive performance metrics
- Technical indicators dashboard
- Benchmark comparison charts
- Time range analysis

### AI Assistant (`/practice`)
- FinAI chat interface for investment advice
- Google Search integration
- Google Sheets integration
- Voice-enabled screen analysis

---

## 🎯 Use Cases

### For Individual Investors
- Track all investments in one place
- Monitor portfolio performance against benchmarks
- Get AI-powered investment recommendations
- Plan and track financial goals
- Analyze technical indicators for trading decisions

### For Financial Planning
- Set multiple financial goals
- Calculate required SIP amounts for goals
- Analyze debt payoff strategies
- Optimize tax-saving investments
- Assess insurance coverage gaps

### For Active Traders
- Real-time Zerodha portfolio sync
- Technical indicator analysis
- Performance benchmarking
- Holdings tracking and management

---

## 🔐 Privacy & Security

- **Local-First**: All data stored locally on your device
- **No Cloud Dependency**: Your financial data never leaves your machine
- **Secure API Integration**: Encrypted connections to external services
- **Privacy-Focused**: No tracking, no analytics, no data collection

---

## 🌍 Multi-Currency Support

While optimized for the Indian market (INR), the platform supports:
- **Primary Currency**: Indian Rupee (₹)
- **Real-time Exchange Rates**: For multi-currency portfolios
- **Localized Formatting**: Indian number formatting (lakhs, crores)

---

## 📊 Data Visualization

- **Interactive Charts**: SVG-based performance graphs
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Adapts to different screen sizes
- **Dark Mode**: Eye-friendly dark theme option
- **Color-Coded Metrics**: Green for gains, red for losses

---

## 🚀 Performance

- **Fast Load Times**: Optimized Next.js build
- **Real-time Updates**: Instant recalculation on data changes
- **Smooth Animations**: 60fps transitions
- **Efficient Rendering**: React optimization and code splitting

---

## 🎨 Design Philosophy

Portfolio Manager is built with a focus on:
- **Simplicity**: Clean, uncluttered interface
- **Clarity**: Easy-to-understand metrics and visualizations
- **Efficiency**: Quick access to all features
- **Beauty**: Modern, polished design
- **Accessibility**: Works for users of all technical levels

---

## 🔮 Future Enhancements

- **Advanced Analytics**: More sophisticated portfolio analysis
- **Tax Reporting**: Automated tax calculation and reporting
- **Multi-Portfolio Support**: Manage multiple portfolios
- **Mobile App**: Native iOS and Android applications
- **Collaborative Features**: Share portfolios with advisors
- **Automated Rebalancing**: AI-powered portfolio rebalancing suggestions

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

Built with ❤️ for the Indian investing community.

**Powered by:**
- Next.js
- Alpha Vantage
- Zerodha
- Google Gemini
- FinAI

---

*Take control of your financial future with Portfolio Manager.*
