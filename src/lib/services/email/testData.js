import { getTodayKey, getTomorrowKey } from "./formatters.js";

export function getTestData() {
  var todayKey = getTodayKey();
  var tomorrowKey = getTomorrowKey();
  var parts = todayKey.split("-");
  var todayDisplay = parts[2] + "/" + parts[1] + "/" + parts[0];
  var tparts = tomorrowKey.split("-");
  var tomorrowDisplay = tparts[2] + "/" + tparts[1] + "/" + tparts[0];

  var todayQuotations = [
    {
      quotationNo: "Q-TEST-001",
      customerName: "ABC Industries",
      location: "Raipur",
      quotationDate: todayDisplay,
      division: "Test Division",
      engineer: "dme@deepsikha.in",
      items: [
        {
          partNumber: "TEST-PUMP-001",
          description: "Grundfos Test Pump",
          quantity: 2,
          unitPrice: 50000,
          totalAmount: 100000,
        },
      ],
      totalAmount: 100000,
    },
    {
      quotationNo: "Q-TEST-002",
      customerName: "XYZ Steel",
      location: "Bhilai",
      quotationDate: todayDisplay,
      division: "Test Division",
      engineer: "dme@deepsikha.in",
      items: [
        {
          partNumber: "TEST-PUMP-002",
          description: "Grundfos Test Pump",
          quantity: 1,
          unitPrice: 75000,
          totalAmount: 75000,
        },
      ],
      totalAmount: 75000,
    },
    {
      quotationNo: "Q-TEST-003",
      customerName: "PQR Cement",
      location: "Korba",
      quotationDate: todayDisplay,
      division: "Test Division",
      engineer: "dme@deepsikha.in",
      items: [
        {
          partNumber: "TEST-PUMP-003",
          description: "Test Pump",
          quantity: 3,
          unitPrice: 25000,
          totalAmount: 75000,
        },
      ],
      totalAmount: 75000,
    },
  ];

  var todayPendingFollowups = [
    {
      quotationNo: "Q-TEST-001",
      customerName: "ABC Industries",
      location: "Raipur",
      nextFollowupDate: todayDisplay,
      followupStatus: "Pending",
      followupRemark: "Call customer regarding quotation",
      engineer: "dme@deepsikha.in",
    },
    {
      quotationNo: "Q-TEST-002",
      customerName: "XYZ Steel",
      location: "Bhilai",
      nextFollowupDate: todayDisplay,
      followupStatus: "Pending",
      followupRemark: "Discuss revised price",
      engineer: "dme@deepsikha.in",
    },
  ];

  var todayWonOrders = [
    {
      quotationNo: "Q-TEST-001",
      customerName: "ABC Industries",
      location: "Raipur",
      orderNumber: "ORD-TEST-001",
      orderStatus: "Won",
      orderWonValue: 100000,
      orderReceivedDate: todayDisplay,
      orderDate: todayDisplay,
      items: [
        {
          partNumber: "TEST-PUMP-001",
          description: "Grundfos Test Pump",
          quantity: 2,
          unitPrice: 50000,
          totalAmount: 100000,
        },
      ],
    },
    {
      quotationNo: "Q-TEST-002",
      customerName: "XYZ Steel",
      location: "Bhilai",
      orderNumber: "ORD-TEST-002",
      orderStatus: "Won",
      orderWonValue: 75000,
      orderReceivedDate: todayDisplay,
      orderDate: todayDisplay,
      items: [
        {
          partNumber: "TEST-PUMP-002",
          description: "Grundfos Test Pump",
          quantity: 1,
          unitPrice: 75000,
          totalAmount: 75000,
        },
      ],
    },
  ];

  var todayOtherStatus = [
    {
      quotationNo: "Q-TEST-001",
      customerName: "ABC Industries",
      location: "Raipur",
      orderStatus: "Loss",
      orderNumber: "ORD-LOSS-001",
      orderReceivedDate: todayDisplay,
      engineer: "dme@deepsikha.in",
    },
    {
      quotationNo: "Q-TEST-002",
      customerName: "XYZ Steel",
      location: "Bhilai",
      orderStatus: "Dead",
      orderNumber: "",
      orderReceivedDate: todayDisplay,
      engineer: "dme@deepsikha.in",
    },
    {
      quotationNo: "Q-TEST-003",
      customerName: "PQR Cement",
      location: "Korba",
      orderStatus: "Partial",
      orderNumber: "ORD-PART-001",
      orderReceivedDate: todayDisplay,
      engineer: "dme@deepsikha.in",
    },
  ];

  var tomorrowPendingFollowups = [
    {
      quotationNo: "Q-TEST-004",
      customerName: "Tomorrow Test Customer 1",
      location: "Raipur",
      nextFollowupDate: tomorrowDisplay,
      followupStatus: "Pending",
      followupRemark: "Call customer",
      engineer: "dme@deepsikha.in",
      contactPerson: "Mr. Tomorrow 1",
      contactNumber: "9000000001",
      partNumber: "TEST-PUMP-004",
      partDescription: "Test Pump Model A",
    },
    {
      quotationNo: "Q-TEST-005",
      customerName: "Tomorrow Test Customer 2",
      location: "Bilaspur",
      nextFollowupDate: tomorrowDisplay,
      followupStatus: "Pending",
      followupRemark: "Send quotation revision",
      engineer: "dme@deepsikha.in",
      contactPerson: "Mr. Tomorrow 2",
      contactNumber: "9000000002",
      partNumber: "TEST-PUMP-005",
      partDescription: "Test Pump Model B",
    },
  ];

  var totalQuotationValue = todayQuotations.reduce(
    function (sum, q) { return sum + (Number(q.totalAmount) || 0); },
    0
  );
  var totalOrdersWonValue = todayWonOrders.reduce(
    function (sum, o) { return sum + (Number(o.orderWonValue) || 0); },
    0
  );

  return {
    todayKey: todayKey,
    tomorrowKey: tomorrowKey,
    todayDisplay: todayDisplay,
    totalFollowUpsToday: todayPendingFollowups.length,
    totalQuotationsMadeToday: todayQuotations.length,
    totalQuotationValue: totalQuotationValue,
    totalOrdersWonToday: todayWonOrders.length,
    totalOrdersWonValue: totalOrdersWonValue,
    todayQuotations: todayQuotations,
    todayPendingFollowups: todayPendingFollowups,
    todayWonOrders: todayWonOrders,
    todayOtherStatus: todayOtherStatus,
    tomorrowPendingFollowups: tomorrowPendingFollowups,
  };
}
