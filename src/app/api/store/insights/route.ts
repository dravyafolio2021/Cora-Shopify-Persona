import { NextRequest, NextResponse } from 'next/server';
import { 
  getShopInfo, 
  getCustomers, 
  getRecentOrders, 
  getProducts, 
  computePersonas, 
  PERSONA_META 
} from '@/lib/shopify';

export async function GET(req: NextRequest) {
  try {
    // Fetch all core Shopify store data in parallel
    const [shop, { customers }, orders, products] = await Promise.all([
      getShopInfo(),
      getCustomers(undefined, 100),
      getRecentOrders(undefined, 100),
      getProducts()
    ]);

    const customersWithPersonas = computePersonas(customers);

    // --- 1. CORE GENERAL METRICS ---
    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    // --- 2. COHORT ANALYTICS ---
    const cohortStats: Record<string, { count: number; totalSpent: number; avgLtv: number; percentage: number }> = {};
    
    // Initialize all personas in the map
    Object.keys(PERSONA_META).forEach(key => {
      cohortStats[key] = { count: 0, totalSpent: 0, avgLtv: 0, percentage: 0 };
    });

    customersWithPersonas.forEach(c => {
      const persona = c.persona || 'Prospect';
      if (cohortStats[persona]) {
        cohortStats[persona].count += 1;
        cohortStats[persona].totalSpent += parseFloat(c.total_spent || '0');
      }
    });

    const totalCustomersCount = customersWithPersonas.length;
    Object.keys(cohortStats).forEach(key => {
      const stats = cohortStats[key];
      stats.percentage = totalCustomersCount > 0 ? (stats.count / totalCustomersCount) * 100 : 0;
      stats.avgLtv = stats.count > 0 ? stats.totalSpent / stats.count : 0;
    });

    // --- 3. PRODUCT METRICS ---
    const productSalesMap: Record<number, { title: string; image?: string; revenue: number; quantity: number; repeatBuyers: Set<number>; uniqueBuyers: Set<number> }> = {};

    // Populate lookup
    products.forEach(p => {
      productSalesMap[p.id] = {
        title: p.title,
        image: p.image?.src || (p.images && p.images[0]?.src) || undefined,
        revenue: 0,
        quantity: 0,
        repeatBuyers: new Set(),
        uniqueBuyers: new Set()
      };
    });

    // Process orders to calculate sales by product
    orders.forEach(order => {
      const customerId = order.customer?.id;
      order.line_items.forEach(item => {
        // Attempt to find the product ID from products list matching by title
        const matchedProd = products.find(p => p.title.toLowerCase() === item.title.toLowerCase());
        const prodId = matchedProd ? matchedProd.id : 99999 + Math.floor(Math.random() * 1000); // fallback random key

        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = {
            title: item.title,
            revenue: 0,
            quantity: 0,
            repeatBuyers: new Set(),
            uniqueBuyers: new Set()
          };
        }

        const itemRev = parseFloat(item.price) * item.quantity;
        productSalesMap[prodId].revenue += itemRev;
        productSalesMap[prodId].quantity += item.quantity;

        if (customerId) {
          if (productSalesMap[prodId].uniqueBuyers.has(customerId)) {
            productSalesMap[prodId].repeatBuyers.add(customerId);
          } else {
            productSalesMap[prodId].uniqueBuyers.add(customerId);
          }
        }
      });
    });

    // Convert product metrics map to sorted lists
    const productInsightsList = Object.keys(productSalesMap).map(key => {
      const id = parseInt(key);
      const metrics = productSalesMap[id];
      const uniqueCount = metrics.uniqueBuyers.size;
      const repeatCount = metrics.repeatBuyers.size;
      const repeatRate = uniqueCount > 0 ? (repeatCount / uniqueCount) * 100 : 0;

      return {
        id,
        title: metrics.title,
        image: metrics.image,
        revenue: metrics.revenue,
        quantity: metrics.quantity,
        repeatRate: repeatRate
      };
    });

    const topProductsByRevenue = [...productInsightsList]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // --- 4. SALES DYNAMICS (Over time) ---
    // Group recent 100 orders by date
    const dailySalesMap: Record<string, { revenue: number; count: number }> = {};
    orders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailySalesMap[dateStr]) {
        dailySalesMap[dateStr] = { revenue: 0, count: 0 };
      }
      dailySalesMap[dateStr].revenue += parseFloat(o.total_price);
      dailySalesMap[dateStr].count += 1;
    });

    const salesDynamics = Object.keys(dailySalesMap).map(date => ({
      date,
      revenue: dailySalesMap[date].revenue,
      orders: dailySalesMap[date].count
    })).slice(0, 10).reverse();

    // --- 5. ACTIONABLE REVENUE RECOMMENDATIONS ---
    const recommendations = [];

    // VIP Loyalty WhatsApp broadcast
    const vipStats = cohortStats['High Value'];
    if (vipStats && vipStats.count > 0) {
      const estUplift = vipStats.count * (aov * 0.18);
      recommendations.push({
        id: 'vip-appreciation',
        title: 'VIP Exclusive WhatsApp Rewards',
        description: `Your "High Value" cohort represents ${vipStats.percentage.toFixed(0)}% of your customer base but contributes the highest LTV. Engage these ${vipStats.count} VIPs with an exclusive early-access WhatsApp broadcast.`,
        cohort: 'High Value',
        estRevenue: estUplift.toFixed(2),
        actionText: 'Launch VIP Broadcast',
        metricText: `₹${vipStats.avgLtv.toFixed(0)} Avg Spend`,
        type: 'WhatsApp'
      });
    }

    // Win-back campaign for At Risk customers
    const atRiskStats = cohortStats['At Risk'];
    if (atRiskStats && atRiskStats.count > 0) {
      const estUplift = atRiskStats.count * (aov * 0.12);
      recommendations.push({
        id: 'winback-atrisk',
        title: 'At-Risk Win-back WhatsApp Trigger',
        description: `You have ${atRiskStats.count} customers who haven't ordered in 90+ days. Schedule an incentive-based win-back sequence with a 15% discount code to re-engage them.`,
        cohort: 'At Risk',
        estRevenue: estUplift.toFixed(2),
        actionText: 'Setup Win-back Sequence',
        metricText: `${atRiskStats.percentage.toFixed(0)}% of Cohorts`,
        type: 'SMS/WhatsApp'
      });
    }

    // Cross-sell campaign based on top product
    const topRevenueProduct = topProductsByRevenue[0];
    const oneTimeStats = cohortStats['One-Time'];
    if (topRevenueProduct && oneTimeStats && oneTimeStats.count > 0) {
      const estUplift = oneTimeStats.count * (aov * 0.09);
      recommendations.push({
        id: 'cross-sell-top',
        title: `Cross-Sell to ${topRevenueProduct.title} Buyers`,
        description: `Target One-Time buyers who purchased "${topRevenueProduct.title}". Send an automated recommendation pitching your complementary products based on purchase affinity patterns.`,
        cohort: 'One-Time',
        estRevenue: estUplift.toFixed(2),
        actionText: 'Activate Cross-Sell Automation',
        metricText: `₹${topRevenueProduct.revenue.toFixed(0)} Revenue`,
        type: 'Email'
      });
    }

    // Low stock urgency campaign
    const lowStockProducts = products
      .filter(p => p.variants.some(v => v.inventory_quantity > 0 && v.inventory_quantity < 5))
      .slice(0, 2);

    if (lowStockProducts.length > 0) {
      const targetCount = totalCustomersCount > 0 ? Math.ceil(totalCustomersCount * 0.4) : 15;
      const estUplift = targetCount * (aov * 0.07);
      recommendations.push({
        id: 'urgency-stock',
        title: `Urgency Broadcast: "${lowStockProducts[0].title}" Low Stock`,
        description: `Variant inventory for "${lowStockProducts[0].title}" is below 5 units. Run an urgency-driven WhatsApp broadcast to prospects and past buyers before it goes out of stock.`,
        cohort: 'All Cohorts',
        estRevenue: estUplift.toFixed(2),
        actionText: 'Send Urgency Blast',
        metricText: `Low Stock Warning`,
        type: 'WhatsApp'
      });
    }

    return NextResponse.json({
      shop,
      metrics: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders: totalOrdersCount,
        totalCustomers: totalCustomersCount,
        aov: aov.toFixed(2),
        currency: shop.currency
      },
      cohortStats,
      topProducts: topProductsByRevenue,
      salesDynamics,
      recommendations,
      recentOrders: orders.slice(0, 10)
    });

  } catch (error: any) {
    console.error('Insights Engine Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
