import { CosmosClient } from "@azure/cosmos";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "MANAGER" | "OPERATOR";
  isActive: boolean;
  passwordHash: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string; // SKU
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  barcode: string;
  dimensions: {
    weightKg: number;
    widthCm: number;
    heightCm: number;
    depthCm: number;
  };
  images: string[];
  baseSellingPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string; // composite: WH-ID_SKU
  sku: string;
  warehouseId: string;
  location: string;
  quantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  lastStockTakeDate: string;
  updatedAt: string;
  updatedBy: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  sku: string;
  quantity: number;
  reason: string;
  condition: "RESELLABLE" | "DAMAGED" | "REFURBISHABLE";
}

export interface Return {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  status:
    | "INITIATED"
    | "IN_TRANSIT"
    | "RECEIVED"
    | "INSPECTED"
    | "REFUNDED"
    | "REJECTED";
  items: ReturnItem[];
  refundAmount: number;
  inspectionNotes?: string;
  inspectedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  createdMonth: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  entityId: string;
  entityType: string;
  changes: any;
  ipAddress: string;
}

class DatabaseService {
  private useCosmos: boolean = false;
  private cosmosClient?: CosmosClient;
  private databaseId = "inventory-db";

  public users: Map<string, User> = new Map();
  public products: Map<string, Product> = new Map();
  public inventory: Map<string, InventoryItem> = new Map();
  public orders: Map<string, Order> = new Map();
  public returns: Map<string, Return> = new Map();
  public auditLogs: AuditLog[] = [];

  constructor() {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;

    if (endpoint && key) {
      try {
        this.cosmosClient = new CosmosClient({ endpoint, key });
        this.useCosmos = true;
        console.log("DatabaseService: Connected to Azure Cosmos DB");
      } catch (err) {
        console.error(
          "DatabaseService: Failed to connect to Azure Cosmos DB. Using local memory.",
          err,
        );
      }
    } else {
      console.log(
        "DatabaseService: Azure Cosmos DB credentials not found. Using local in-memory fallback.",
      );
    }

    this.seedLocalDb();
  }

  private seedLocalDb() {
    const seedUsers: User[] = [
      {
        id: "usr_admin",
        email: "admin@enterprise.com",
        displayName: "Admin User",
        role: "ADMIN",
        isActive: true,
        passwordHash: bcrypt.hashSync("Admin@123", 10),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "usr_manager",
        email: "manager@enterprise.com",
        displayName: "Manager User",
        role: "MANAGER",
        isActive: true,
        passwordHash: bcrypt.hashSync("Manager@123", 10),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "usr_operator",
        email: "operator@enterprise.com",
        displayName: "Operator User",
        role: "OPERATOR",
        isActive: true,
        passwordHash: bcrypt.hashSync("Operator@123", 10),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    seedUsers.forEach((u) => this.users.set(u.id, u));

    // 2. Seed Products
    const seedProducts: Product[] = [
      {
        id: "ELEC-LAP-001",
        sku: "ELEC-LAP-001",
        name: "Enterprise Laptop v14",
        description: "14 inch productivity laptop, 16GB RAM, 512GB SSD",
        category: "Electronics",
        brand: "ProTech",
        barcode: "074586321904",
        dimensions: {
          weightKg: 1.4,
          widthCm: 32.2,
          heightCm: 1.8,
          depthCm: 21.4,
        },
        images: [
          "https://stinventorydev.blob.core.windows.net/products/elec-lap-001-primary.jpg",
        ],
        baseSellingPrice: 999.99,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "ELEC-MOU-002",
        sku: "ELEC-MOU-002",
        name: "Ergonomic Wireless Mouse",
        description: "Rechargeable silent click ergonomic mouse",
        category: "Electronics",
        brand: "ClickSoft",
        barcode: "074586321905",
        dimensions: {
          weightKg: 0.1,
          widthCm: 12.0,
          heightCm: 4.5,
          depthCm: 7.0,
        },
        images: [],
        baseSellingPrice: 49.99,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "OFFC-CHR-003",
        sku: "OFFC-CHR-003",
        name: "Executive Mesh Office Chair",
        description: "Ergonomic office chair with high back and lumbar support",
        category: "Furniture",
        brand: "ComfortSeat",
        barcode: "074586321906",
        dimensions: {
          weightKg: 15.0,
          widthCm: 65.0,
          heightCm: 120.0,
          depthCm: 60.0,
        },
        images: [],
        baseSellingPrice: 249.99,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    seedProducts.forEach((p) => this.products.set(p.sku, p));

    // 3. Seed Inventory
    const seedInventory: InventoryItem[] = [
      {
        id: "inv_WH-EAST-01_ELEC-LAP-001",
        sku: "ELEC-LAP-001",
        warehouseId: "WH-EAST-01",
        location: "Aisle 4, Shelf C, Bin 12",
        quantity: 145,
        reorderLevel: 20,
        costPrice: 650.0,
        sellingPrice: 999.99,
        status: "IN_STOCK",
        lastStockTakeDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_admin",
      },
      {
        id: "inv_WH-EAST-01_ELEC-MOU-002",
        sku: "ELEC-MOU-002",
        warehouseId: "WH-EAST-01",
        location: "Aisle 2, Shelf B, Bin 3",
        quantity: 8,
        reorderLevel: 15,
        costPrice: 20.0,
        sellingPrice: 49.99,
        status: "LOW_STOCK",
        lastStockTakeDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_admin",
      },
      {
        id: "inv_WH-WEST-02_OFFC-CHR-003",
        sku: "OFFC-CHR-003",
        warehouseId: "WH-WEST-02",
        location: "Aisle 8, Shelf F, Bin 1",
        quantity: 0,
        reorderLevel: 5,
        costPrice: 120.0,
        sellingPrice: 249.99,
        status: "OUT_OF_STOCK",
        lastStockTakeDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_admin",
      },
    ];
    seedInventory.forEach((i) => this.inventory.set(i.id, i));

    // 4. Seed Orders
    const seedOrders: Order[] = [
      {
        id: "ord_01J54XYZ",
        orderNumber: "ORD-2026-00001",
        customerId: "cust_microsoft_01",
        customerName: "Microsoft Corp",
        status: "DELIVERED",
        items: [
          {
            sku: "ELEC-LAP-001",
            name: "Enterprise Laptop v14",
            quantity: 5,
            unitPrice: 999.99,
            totalPrice: 4999.95,
          },
        ],
        totalAmount: 4999.95,
        shippingAddress: {
          street: "1 Microsoft Way",
          city: "Redmond",
          state: "WA",
          zipCode: "98052",
          country: "USA",
        },
        trackingNumber: "1Z999AA10123456784",
        createdAt: "2026-06-25T10:00:00Z",
        updatedAt: "2026-06-28T14:30:00Z",
      },
      {
        id: "ord_02K65UVW",
        orderNumber: "ORD-2026-00002",
        customerId: "cust_amazon_02",
        customerName: "Amazon.com Inc",
        status: "PROCESSING",
        items: [
          {
            sku: "ELEC-MOU-002",
            name: "Ergonomic Wireless Mouse",
            quantity: 10,
            unitPrice: 49.99,
            totalPrice: 499.9,
          },
        ],
        totalAmount: 499.9,
        shippingAddress: {
          street: "410 Terry Ave N",
          city: "Seattle",
          state: "WA",
          zipCode: "98109",
          country: "USA",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    seedOrders.forEach((o) => this.orders.set(o.id, o));

    // 5. Seed Returns
    const seedReturns: Return[] = [
      {
        id: "ret_09K21LMN",
        returnNumber: "RET-2026-00001",
        orderId: "ord_01J54XYZ",
        orderNumber: "ORD-2026-00001",
        customerId: "cust_microsoft_01",
        status: "REFUNDED",
        items: [
          {
            sku: "ELEC-LAP-001",
            quantity: 1,
            reason: "Defective screen backlight",
            condition: "DAMAGED",
          },
        ],
        refundAmount: 999.99,
        inspectionNotes: "Confirmed backlight flickering. Processed refund.",
        inspectedBy: "usr_admin",
        createdAt: "2026-06-29T09:00:00Z",
        updatedAt: "2026-06-30T16:00:00Z",
      },
    ];
    seedReturns.forEach((r) => this.returns.set(r.id, r));

    // 6. Seed Audit Logs
    this.auditLogs.push({
      id: "log_001",
      createdMonth: "2026-06",
      timestamp: "2026-06-25T10:05:00Z",
      userId: "usr_admin",
      userEmail: "admin@enterprise.com",
      action: "CREATE_ORDER",
      entityId: "ord_01J54XYZ",
      entityType: "ORDER",
      changes: { status: { old: null, new: "PENDING" } },
      ipAddress: "127.0.0.1",
    });
  }

  // Generic audit logging helper
  public logAction(
    userId: string,
    email: string,
    action: string,
    entityId: string,
    entityType: string,
    changes: any,
    ip: string = "127.0.0.1",
  ) {
    const timestamp = new Date().toISOString();
    const createdMonth = timestamp.slice(0, 7);

    const log: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 11).toUpperCase(),
      createdMonth,
      timestamp,
      userId,
      userEmail: email,
      action,
      entityId,
      entityType,
      changes,
      ipAddress: ip,
    };

    console.log("ADDING LOG:", log);
    this.auditLogs.unshift(log);
    console.log("TOTAL LOGS:", this.auditLogs.length);
  }
  public findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  }

  public findUserById(id: string): User | undefined {
    return this.users.get(id);
  }
}
export const db = new DatabaseService();
