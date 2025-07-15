import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast, Bounce } from "react-toastify";
import Select from "react-select";
import LayOut from "../../LayOut/LayOut";
import { useAuth } from "../../Context/AuthContext";
import { InvoicePostApi } from "../../Utils/Axios";
import { fetchCustomers } from "../../Redux/CustomerSlice";
import { fetchBanks } from "../../Redux/BankSlice";
import DeletePopup from "../../Utils/DeletePopup";
import { TemplateGetAPI } from "../../Utils/Axios";
import InvoicePreview from "../../CompanyModule/Settings/InvoiceTemplates/InvoicePreview";

const InvoiceRegistration = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    trigger,
    watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  // Select data from Redux store
  // const customers = useSelector(selectCustomers) || []; // Ensure it's an array
  //const products = useSelector(selectProducts);
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customers);
  const { products } = useSelector((state) => state.products);
  const { banks } = useSelector((state) => state.banks);
  const [productData, setProductData] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [invoiceData, setInvoiceData] = useState(null);
  const [productColumns, setProductColumns] = useState([
    { key: "items", title: "Item", type: "text", required: true },
    { key: "hsn", title: "HSN-no", type: "text", required: true },
    { key: "service", title: "Service", type: "text", required: true },
    { key: "quantity", title: "Quantity", type: "number", required: true },
    { key: "unitCost", title: "Unit Cost", type: "number", required: true },
    { key: "gstPercentage", title: "GST (%)", type: "percentage", required: true },
    { key: "totalCost", title: "Total Cost", type: "number", required: false },
  ]);
  const authUser = useAuth();
  const company = authUser?.company || {};
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const { employee } = useAuth();
  const companyId = employee?.companyId;
  const [showPreview, setShowPreview] = useState(false);
  const [load, setLoad] = useState(false); // to manage loading state for API calls
  const [customer, setCustomer] = useState(customers); // List of customers for the dropdown
  const [product, setProduct] = useState(products);
  const [formattedProducts, setFormattedProducts] = useState(products);
  const [formattedBanks, setFormattedBanks] = useState(banks);
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateAvailable, setTemplateAvailable] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [productError, setProductError] = useState(null);
  const [templateFields, setTemplateFields] = useState({
    showShipTo: false,
    showNotes: false,
    showSalesPerson: false,
    showShippingMethod: false,
    showShippingTerms: false,
    showPaymentTerms: false,
    showDeliveryDate: false,
  });
  const [showValidations, setShowValidations] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers(companyId));
    // dispatch(fetchProducts());
    dispatch(fetchBanks(companyId));
  }, [dispatch, companyId]);

  const subTotal = parseFloat(
    productData
      .reduce((sum, row) => sum + (parseFloat(row.totalCost) || 0), 0)
      .toFixed(2)
  );

  const validateInput = (type, value) => {
    if (value === "") return true; // Allow clearing the field
    if (/^\s$/.test(value)) return false; // Disallow leading & trailing spaces
    if (type === "text") return /^[a-zA-Z0-9 _\-.,&()]+$/.test(value); // Allows letters, numbers, spaces, and special characters
    if (type === "number") return /^\d+(\.\d{1,2})?$/.test(value);
    if (type === "percentage") return /^([0-9]{1,2}|100)%?$/.test(value); // 1-3 digits with %
    return true;
  };
  const getProductFieldValidation = (col) => {
    switch (col.key) {
      case "items":
        return {
          minLength: { value: 3, message: "Item Name must be at least 3 characters" },
          maxLength: { value: 150, message: "Item Name cannot exceed 150 characters" },
        };
      case "hsn":
        return {
          minLength: { value: 2, message: "HSN No must be at least 2 characters" },
          maxLength: { value: 8, message: "HSN No cannot exceed 8 characters" },
        };
      case "service":
        return {
          minLength: { value: 3, message: "Service must be at least 3 characters" },
          maxLength: { value: 60, message: "Service cannot exceed 60 characters" },
        };
      case "quantity":
        return {
          maxLength: { value: 7, message: "Quantity cannot exceed 7 digits" },
        };
      case "unitCost":
        return {
          maxLength: { value: 10, message: "Unit Cost cannot exceed 10 digits" },
        };
      default:
        return {};
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNumber = res.data.data.invoiceTemplateNo;
      setSelectedTemplate(templateNumber);
      setTemplateAvailable(!!templateNumber);

      // Set fields visibility based on template
      if (templateNumber === "1") {
        setTemplateFields({
          showShipTo: false,
          showNotes: false,
          showSalesPerson: true,
          showShippingMethod: true,
          showShippingTerms: true,
          showPaymentTerms: true,
          showDeliveryDate: true,
        });
      } else if (templateNumber === "2") {
        setTemplateFields({
          showShipTo: true,
          showNotes: true,
          showSalesPerson: false,
          showShippingMethod: false,
          showShippingTerms: false,
          showPaymentTerms: false,
          showDeliveryDate: false,
        });
      }
    } catch (error) {
      handleError(error);
      setTemplateAvailable(false);
    }
  };

  const updateData = (index, key, value) => {
    const colType =
      productColumns.find((col) => col.key.toLowerCase() === key.toLowerCase())
        ?.type || "text";
    const normalizedKey = key.toLowerCase() === "quantity" ? "quantity" : key;

    // Validate using validateInput for product details only
    if (!validateInput(colType, value)) {
      setFieldErrors((prev) => ({
        ...prev,
        [index]: {
          ...(prev[index] || {}),
          [normalizedKey]: `Invalid ${colType} value`,
        },
      }));
      // Optionally, return here to prevent updating invalid value
      return;
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [index]: {
          ...(prev[index] || {}),
          [normalizedKey]: null,
        },
      }));
    }

    // ...existing update logic...
    setProductData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], [normalizedKey]: value };

      // Auto-calculate totalCost if quantity/unitCost/GST changes
      if (["quantity", "unitCost", "gstPercentage"].includes(normalizedKey)) {
        const quantity = parseFloat(updatedData[index].quantity) || 0;
        const unitCost = parseFloat(updatedData[index].unitCost) || 0;
        const gstPercentage = parseFloat(updatedData[index].gstPercentage) || 0;

        if (value === "") {
          updatedData[index].totalCost = "";
        } else {
          const subTotal = quantity * unitCost;
          const gstAmount = (subTotal * gstPercentage) / 100;
          updatedData[index].totalCost = (subTotal + gstAmount).toFixed(2);
        }
      }

      return updatedData;
    });

    // ...existing field-specific validation logic (optional)...
  };

  useEffect(() => {
    if (Array.isArray(products)) {
      const productOptions = products.map((product) => ({
        value: product.productId,
        label: product.productName,
        hsnNo: product.hsnNo,
        productCost: product.productCost,
      }));
      setFormattedProducts(productOptions);
    }
  }, [products]);

  useEffect(() => {
    if (companyId) {
      console.log("fetchBanks", fetchBanks);
      dispatch(fetchBanks(companyId));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    console.log("Banks from Redux store:", banks);
  }, [banks]);

  // Filter banks based on search term
  useEffect(() => {
    if (Array.isArray(banks)) {
      const bankOptions = banks.map((bank) => ({
        value: bank.bankId,
        label: bank.bankName,
        // Include the full bank object
        bankData: bank,
      }));
      setFormattedBanks(bankOptions);
    }
  }, [banks]);
  const handleCustomerChange = (selectedOption) => {
    setInvoiceData(selectedOption);
    console.log("selectedOption", selectedOption);
    //setValue("vendorCode", selectedOption.value);
  };

  useEffect(() => {
    if (companyId) {
      dispatch(fetchCustomers(companyId));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    console.log("Customers from Redux store:", customers);
  }, [customers]);

  useEffect(() => {
    if (customers && Array.isArray(customers)) {
      const result = customers.filter((customer) =>
        customer.customerName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(result);
    } else {
      setFilteredData([]);
    }
  }, [search, customers]);

  useEffect(() => {
    console.log("Customers from Redux store:", products);
  }, [products]);

  useEffect(() => {
    if (products && Array.isArray(products)) {
      const result = products.filter((product) =>
        product.productName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(result);
    } else {
      setFilteredData([]);
    }
  }, [search, products]);

  useEffect(() => {
    // Check if customers is an array before using map
    const productOptions = Array.isArray(products)
      ? products.map((prod) => ({
        value: prod.productId,
        label: prod.productName,
      }))
      : [];

    setProduct(productOptions);
    console.log(productOptions);
  }, [products]);

  useEffect(() => {
    // Check if customers is an array before using map
    const customerOptions = Array.isArray(customers)
      ? customers.map((cust) => ({
        value: cust.customerId,
        label: cust.customerName,
      }))
      : [];

    setCustomer(customerOptions);
    console.log(customerOptions);
  }, [customers]);

  const onSubmit = (data) => {
    // Prevent submission if no product details are entered
    setShowValidations(true); // Show all errors at submission time

    const isValid = productData.every(row =>
      productColumns.every(col =>
        col.key === "totalCost" || row[col.key]
      )
    );

    if (productData.length === 0) {
      setProductError("Please add at least one product detail before submitting");
      return;
    }
    else if (!isValid) {
      setProductError("Please fill all fields before submitting");
      return;
    }

    const selectedCustomer = customers.find(
      (cust) => cust.customerId === data.customerName.value
    );

    const selectedBankOption = formattedBanks.find(
      (bank) => bank.value === data.bankName
    );
    const selectedBank = selectedBankOption?.bankData;

    // Format product data to match backend expectations
    const formattedProductData = productData.map((item, index) => ({
      items: item.items,
      hsn: item.hsn,
      service: item.service,
      quantity: item.quantity,
      unitCost: item.unitCost,
      gstPercentage: item.gstPercentage,
      totalCost: item.totalCost,
    }));

    const previewData = {
      customer: {
        customerName: selectedCustomer?.customerName || "",
        address: selectedCustomer?.address || "",
        mobileNumber: selectedCustomer?.mobileNumber || "",
        email: selectedCustomer?.email || "",
        customerGstNo: selectedCustomer?.customerGstNo || "",
      },
      bank: selectedBank || {},
      invoice: {
        // Shipping info
        shippedPayload: {
          customerName: data.shipToName || "",
          address: data.shipToAddress || "",
          mobileNumber: data.shipToMobile || "",
        },

        // Invoice details
        invoiceNo: "Auto-generated",
        invoiceDate: data.invoiceDate || "",
        dueDate: data.dueDate || "",
        purchaseOrder: data.purchaseOrder || "",
        // Product details
        productData: formattedProductData,
        productColumns: productColumns,
        // Financial details
        subTotal: subTotal.toFixed(2),
        notes: data.notes || "",
        // Bank details - include the full bank object
        // Additional fields
        salesPerson: data.salesPerson || "",
        shippingMethod: data.shippingMethod || "",
        shippingTerms: data.shippingTerms || "",
        paymentTerms: data.paymentTerms || "Net 30",
        deliveryDate: data.deliveryDate || "",
      },
    };

    setPreviewData(previewData);
    console.log("Preview Data:", previewData);
    setSubmissionData({
      ...previewData,
      customerId: selectedCustomer?.customerId,
      bankId: selectedBank?.bankId,
      bankDetails: selectedBank,
    });
    setShowPreview(true);
  };

  const handleConfirmSubmission = async () => {
    try {
      const companyId = company?.id;
      const customerId = submissionData?.customerId;
      const bankId = submissionData?.bankId;
      console.log("bankId*****", bankId);

      if (!companyId || !customerId) {
        throw new Error("Company ID or Customer ID is missing");
      }

      // Transform the data to match backend expectations
      const invoice = submissionData.invoice || {};
      const invoiceData = {
        productData: invoice.productData,
        productColumns: invoice.productColumns,
        shippedPayload: Array.isArray(invoice.shippedPayload)
          ? invoice.shippedPayload || {}
          : invoice.shippedPayload || {},
        vendorCode: invoice.vendorCode,
        purchaseOrder: invoice.purchaseOrder,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        subTotal: invoice.subTotal,
        notes: invoice.notes,
        salesPerson: invoice.salesPerson,
        shippingMethod: invoice.shippingMethod,
        shippingTerms: invoice.shippingTerms,
        paymentTerms: invoice.paymentTerms,
        deliveryDate: invoice.deliveryDate,
        status: "Pending", // Default status
        bankId: bankId,
        invoiceTemplateNo: selectedTemplate, // Use selected template or default to "1"
      };

      console.log("Submitting invoice data:", invoiceData);

      const response = await InvoicePostApi(companyId, customerId, invoiceData);

      if (response) {
        setShowPreview(false);
        reset();
        toast.success("Invoice created successfully!");
        navigate("/invoiceView", { state: { refresh: true } }); // Pass state to trigger refresh
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      const errorMsg =
        error?.response?.data?.error?.message || // If error is under error.message
        error?.response?.data?.message ||        // If error is directly under message
        error?.message ||                        // JS error message
        "Failed to create invoice";
      toast.error(errorMsg);
    }
  };

  const preventInvalidInput = (e, type) => {
    const key = e.key;

    // Alphanumeric check for customerName, state, city fields (no special characters allowed except spaces)
    if (type === "alpha" && /[^a-zA-Z\s]/.test(key)) {
      e.preventDefault();
    }

    if (type === "alphaNumeric" && /[^a-zA-Z0-9]/.test(key)) {
      e.preventDefault();
    }

    // Address-specific special characters: only allow &, /, and ,
    if (type === "address" && !/[a-zA-Z0-9\s!@#&()*/.,_+:;'"-]/.test(key)) {
      e.preventDefault();
    }
    // Numeric check for fields that should only allow numbers
    if (type === "numeric" && !/^[0-9]$/.test(key)) {
      e.preventDefault();
    }

    // Prevent spaces (if any additional validation is needed)
    if (type === "whitespace" && key === " ") {
      e.preventDefault();
    }
  };

  const handleInputChange = (e, fieldName) => {
    let value = e.target.value.trimStart().replace(/ {2,}/g, " "); // Remove leading spaces and extra spaces

    if (fieldName !== "email") {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter after space
    }

    setValue(fieldName, value);
    trigger(fieldName); // Trigger validation
  };

  const noTrailingSpaces = (value, fieldName) => {
    // Check if the value ends with a space
    if (value.endsWith(' ')) {
      return "Spaces are not allowed at the end";
    }
    // Check if the value is less than 3 characters long
    if (value.length < 3) {
      return "Minimum 3 characters Required";
    }
    // If no error, return true
    return true;
  };

  const handleError = (errors) => {
    if (errors.response) {
      const status = errors.response.status;
      let errorMessage = "";

      switch (status) {
        case 403:
          errorMessage = "Session Timeout!";
          navigate("/");
          break;
        case 404:
          errorMessage = "Resource Not Found!";
          break;
        case 406:
          errorMessage = "Invalid Details!";
          break;
        case 500:
          errorMessage = "Server Error!";
          break;
        default:
          errorMessage = "An Error Occurred!";
          break;
      }

      toast.error(errorMessage, {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    } else {
      // toast.error("Network Error!", {
      //   position: "top-right",
      //   transition: Bounce,
      //   hideProgressBar: true,
      //   theme: "colored",
      //   autoClose: 3000,
      // });
    }
  };

  const handleClearForm = () => {
    reset({
      customerName: null,
      purchaseOrder: "",
      vendorCode: "",
      invoiceDate: "",
      dueDate: "",
      bankName: null,
      products: [],
      shipToName: "",
      shipToAddress: "",
      shipToMobile: "",
      notes: "",
      salesPerson: "",
      shippingMethod: "",
      shippingTerms: "",
      paymentTerms: "",
      deliveryDate: "",
    });

    setProductData([]); // Clear product rows
    setProductError(null); // Clear product error message
    toast.info("Form cleared!", { position: "top-right", autoClose: 1000 });
  };

  const handleDeleteColumn = (key) => {
    setSelectedItemId(key);
    setDeleteType("column");
    setShowDeleteModal(true);
  };

  // Open delete popup for a row
  const handleDeleteRow = (index) => {
    setSelectedItemId(index);
    setDeleteType("row");
    setShowDeleteModal(true);
  };

  // Close the popup
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
    setDeleteType(null);
  };

  const handleConfirmDelete = (id) => {
    if (deleteType === "column") {
      setProductColumns(productColumns.filter((col) => col.key !== id));
      setProductData(
        productData.map((row) => {
          const newRow = { ...row };
          delete newRow[id];
          return newRow;
        })
      );
    } else if (deleteType === "row") {
      setProductData(productData.filter((_, index) => index !== id));
    }
    handleCloseDeleteModal();
  };

  const handleInvoiceDateChange = (e) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      setValue("dueDate", "");
      return;
    }
    const invoiceDate = new Date(inputValue);
    if (isNaN(invoiceDate)) {
      setValue("dueDate", "");
      return;
    }
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(invoiceDate.getDate() + 15);
    setValue("dueDate", dueDate.toISOString().split("T")[0]);
  };

  const joiningDate = watch("invoiceDate");

  const validateDueDate = (dueDate) => {
    if (!joiningDate)
      return "Invoice Date is required before selecting End Date";

    const joinDateObj = new Date(joiningDate);
    const endDateObj = new Date(dueDate);
    const maxEndDate = new Date(joinDateObj);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1); // 12 months ahead

    if (endDateObj < joinDateObj) {
      return "Due Date cannot be before Invoice Date";
    }
    if (endDateObj > maxEndDate) {
      return "Due Date cannot exceed 1 month from Invoice Date";
    }
    return true;
  };

  useEffect(() => {
    // Dynamically update the max End Date and Accept Date based on the joiningDate
    if (joiningDate) {
      const joiningDateObj = new Date(joiningDate);

      // Set max End Date to 12 months after the joiningDate
      const maxEndDate = new Date(joiningDateObj);
      maxEndDate.setMonth(maxEndDate.getMonth() + 1);
      setValue("dueDate", maxEndDate.toISOString().split("T")[0]);
    }
  }, [joiningDate, setValue]);

  useEffect(() => {
    const invoiceDate = document.getElementById("invoiceDate").value;
    if (invoiceDate) {
      handleInvoiceDateChange({ target: { value: invoiceDate } });
    }
  }, []);

  const updateColumnType = (key, type) => {
    setProductColumns(
      productColumns.map((col) => (col.key === key ? { ...col, type } : col))
    );
  };
  const addColumn = () => {
    if (productColumns.length >= 8) {
      toast.error("You cannot add more than 8 columns.");
      return;
    }

    const newKey = `custom_${productColumns.length}`;
    const newColumn = { key: newKey, title: "New Field", type: "text" };

    const totalCostIndex = productColumns.findIndex(
      (col) => col.key === "totalCost"
    );

    const updatedColumns =
      totalCostIndex !== -1
        ? [
          ...productColumns.slice(0, totalCostIndex),
          newColumn,
          ...productColumns.slice(totalCostIndex),
        ]
        : [...productColumns, newColumn];

    setProductColumns(updatedColumns);
  };
  const updateColumnTitle = (key, title) => {
    // Allow temporary clearing while the employee is typing
    if (title === "") {
      setProductColumns(
        productColumns.map((col) =>
          col.key === key ? { ...col, title: "" } : col
        )
      );
      return;
    }

    // Trim the title to avoid issues with spaces
    const trimmedTitle = title.trim();

    // Prevent invalid titles when the employee confirms the change
    if (trimmedTitle === "New Field") {
      toast.error(
        "Column title cannot be 'New Field'. Please enter a valid title."
      );
      return;
    }

    // Update the column title
    setProductColumns(
      productColumns.map((col) =>
        col.key === key
          ? {
            ...col,
            title: key === "totalCost" ? "Total Amount" : trimmedTitle,
          }
          : col
      )
    );
  };

  const addRow = () => {
    setProductData([...productData, {}]);
    setShowValidations(false); // Hide validation errors for new row
  };

  // Render loading message or template not available message
  if (!templateAvailable) {
    return (
      <LayOut>
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-8 text-center mt-5">
              <h2>No Invoice Template Available</h2>
              <p>
                To set up the Invoice templates before proceeding, Please select
                the Template from Settings{" "}
                <Link
                  to="/invoiceTemplates"
                  className="custom-link text-primary bg-opacity-25"
                >
                  Invoice Templates{" "}
                </Link>
              </p>
              <p>
                Please contact the administrator to set up the Invoice templates
                before proceeding.
              </p>
            </div>
          </div>
        </div>
      </LayOut>
    );
  }

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Invoice Registration</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item active">Invoices</li>
                <li className="breadcrumb-item active">Invoice Registration</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-3">Invoice Registration Form</h5>
                <span
                  className="badge bg-primary"
                  style={{ fontSize: "1rem" }}
                  title="To change the template, go to Settings > Invoice Templates"
                >
                  Current Template: {selectedTemplate || "N/A"}
                </span>
              </div>
              <hr />
              <form
                className="form-horizontal"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="card-body">
                  <h4 className="ml-3" style={{ marginTop: "20px" }}>
                    <b>Invoice Details</b>
                    <span className="text-muted ms-3">
                      Please fill in the required fields marked with{" "}
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  </h4>

                  {/* Customer Name Dropdown */}
                  <div className="form-group row mt-5">
                    <label
                      htmlFor="customer"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Client Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <Controller
                        name="customerName"
                        id="customerName"
                        control={control}
                        rules={{ required: "Client Name is required" }} // Mandatory validation rule
                        render={({ field }) => (
                          <Select
                            {...field} // Spread the controller's field props
                            options={customer} // Pass the formatted customer options
                            onChange={(selectedOption) => {
                              handleCustomerChange(selectedOption); // Handle the change event
                              field.onChange(selectedOption); // Ensure react-hook-form is updated
                            }}
                            getOptionLabel={(e) => e.label} // Customizing label if needed
                            getOptionValue={(e) => e.value} // Customizing value if needed
                          />
                        )}
                      />
                      {errors.customerName && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.customerName.message}
                        </p> // Display error message
                      )}
                    </div>
                  </div>

                  <div className="form-group row mt-1">
                    <label
                      htmlFor="bankName"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Bank Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <Controller
                        name="bankName" // This is the field name in the form
                        control={control}
                        rules={{ required: "Bank Name is required" }} // Validation rule
                        render={({ field }) => (
                          <Select
                            {...field} // Spread the react-hook-form field props
                            options={formattedBanks} // The list of bank options
                            value={
                              formattedBanks.find(
                                (bank) => bank.value === field.value
                              ) || null
                            } // Find the selected bank by matching value (bankId)
                            onChange={(selectedOption) => {
                              // Handle bank selection
                              console.log(
                                "Selected Bank Option:",
                                selectedOption
                              );
                              field.onChange(
                                selectedOption ? selectedOption.value : null
                              ); // Update the bankId (value) in form
                            }}
                            getOptionLabel={(e) => e.label} // Display the bank name (label) in the dropdown
                            getOptionValue={(e) => e.value} // The value corresponds to bankId
                          />
                        )}
                      />
                      {errors.bankName && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.bankName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vendor Code */}
                  <div className="form-group row">
                    <label
                      htmlFor="vendorCode"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Vendor Code <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        name="vendorCode"
                        id="vendorCode"
                        placeholder="Enter Vendor Code"
                        {...register("vendorCode", {
                          required: "Vendor Code is required",
                          pattern: {
                            value:
                              /^(?=.*\d)(?=.*[A-Za-z0-9])[\dA-Za-z()\-_/&]+$/,
                            message:
                              "Must contain at least one number. Only alphabets are not allowed.",
                          },
                          minLength: {
                            value: 3,
                            message:
                              "Vendor Code must be at least 3 characters long",
                          },
                          maxLength: {
                            value: 10,
                            message: "Vendor Code cannot exceed 10 characters",
                          },
                        })}
                      />
                      {errors.vendorCode && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.vendorCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Purchase Order */}
                  <div className="form-group row">
                    <label
                      htmlFor="purchaseOrder"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Purchase Order <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        name="purchaseOrder"
                        id="purchaseOrder"
                        placeholder="Enter Purchase Order"
                        {...register("purchaseOrder", {
                          required: "Purchase Order is required",
                          pattern: {
                            value:
                              /^(?=.*\d)(?=.*[A-Za-z0-9])[\dA-Za-z()\-_/&]+$/,
                            message:
                              "Must contain at least one number. Only alphabets are not allowed.",
                          },
                          minLength: {
                            value: 3,
                            message:
                              "Purchase Order must be at least 3 characters long",
                          },
                          maxLength: {
                            value: 10,
                            message:
                              "Purchase Order cannot exceed 10 characters",
                          },
                        })}
                      />
                      {errors.purchaseOrder && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.purchaseOrder.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Invoice Date */}
                  <div className="form-group row">
                    <label
                      htmlFor="invoiceDate"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Invoice Date <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="date"
                        className="form-control"
                        name="invoiceDate"
                        id="invoiceDate"
                        autoComplete="off"
                        max={new Date().toISOString().split("T")[0]} // Restricts future dates
                        onClick={(e) => e.target.showPicker()}
                        {...register("invoiceDate", {
                          required: "Invoice Date is required",
                          validate: (value) => {
                            if (!value) return true;
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            selectedDate.setHours(0, 0, 0, 0); // Ensure both dates are at midnight
                            if (selectedDate > today) {
                              return "Future dates are not allowed for Invoice Date";
                            }
                            return true;
                          },
                        })}
                      />
                      {errors.invoiceDate && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.invoiceDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="form-group row">
                    <label
                      htmlFor="dueDate"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Due Date
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="date"
                        className="form-control"
                        name="dueDate"
                        id="dueDate"
                        autoComplete="off"
                        onClick={(e) => e.target.showPicker()}
                        {...register("dueDate", {
                          required: "Due Date is required",
                          validate: validateDueDate,
                        })}
                      />
                      {errors.dueDate && (
                        <p className="errorMsg" style={{ marginLeft: "6px" }}>
                          {errors.dueDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {templateFields.showShipTo && (
                    <>
                      <span className="mb-3">
                        <h3 className="mb-1">Shipping Details</h3>
                      </span>
                      <div className="form-group row mt-3">
                        <label
                          htmlFor="shipToName"
                          className="col-sm-2 text-right control-label col-form-label"
                        >
                          Reciever's Name
                        </label>
                        <div className="col-sm-9 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Ship To Name"
                            id="shipToName"
                            {...register("shipToName", {
                              required: "Ship To Name is required",
                              validate: (value) => noTrailingSpaces(value, "shipToName"),
                              maxLength: {
                                value: 100,
                                message:
                                  "Ship To Name cannot exceed 100 characters",
                              },
                            })}
                            onChange={(e) => handleInputChange(e, "shipToName")}
                            onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                          />
                          {errors.shipToName && (
                            <p
                              className="errorMsg"
                              style={{ marginLeft: "6px", marginBottom: "0" }}
                            >
                              {errors.shipToName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="form-group row">
                        <label
                          htmlFor="shipToAddress"
                          className="col-sm-2 text-right control-label col-form-label"
                        >
                          Reciever's Address
                        </label>
                        <div className="col-sm-9 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="shipToAddress"
                            placeholder="Enter Ship To Address"
                            {...register("shipToAddress", {
                              required: "Ship To Address is required",
                              validate: (value) => noTrailingSpaces(value, "shipToAddress"),
                              pattern: {
                                value: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s!@#&()*/.,_+:;'"-]+$/,
                                message: "Invalid Address Format. Only letters, numbers, spaces, and !@#&()*/.,_- \" ' : ; are allowed."
                              },
                              maxLength: {
                                value: 250,
                                message:
                                  "Ship To Address cannot exceed 250 characters",
                              },
                            })}
                            onChange={(e) => handleInputChange(e, "shipToAddress")}
                            onKeyPress={(e) => preventInvalidInput(e, "address")}
                          />
                          {errors.shipToAddress && (
                            <p
                              className="errorMsg"
                              style={{ marginLeft: "6px", marginBottom: "0" }}
                            >
                              {errors.shipToAddress.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="form-group row">
                        <label
                          htmlFor="shipToMobile"
                          className="col-sm-2 text-right control-label col-form-label"
                        >
                          Reciever's Mobile
                        </label>
                        <div className="col-sm-9 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Ship To Mobile"
                            id="shipToMobile"
                            {...register("shipToMobile", {
                              required: "Ship To Mobile is required",
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message:
                                  "Ship To Mobile must be a 10-digit number",
                              },
                            })}
                          />
                          {errors.shipToMobile && (
                            <p
                              className="errorMsg"
                              style={{ marginLeft: "6px", marginBottom: "0" }}
                            >
                              {errors.shipToMobile.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {templateFields.showNotes && (
                    <div className="form-group row">
                      <label
                        htmlFor="notes"
                        className="col-sm-2 text-right control-label col-form-label"
                      >
                        Special Notes
                      </label>
                      <div className="col-sm-9 mb-3">
                        <textarea
                          className="form-control"
                          id="notes"
                          placeholder="Enter special notes and instructions"
                          rows={3}
                          {...register("notes", {
                            required: "Special Notes are required",
                            validate: (value) => noTrailingSpaces(value, "notes"),
                            maxLength: {
                              value: 500,
                              message:
                                "Special Notes cannot exceed 500 characters",
                            },
                          })}
                          onChange={(e) => handleInputChange(e, "notes")}
                        />
                        {errors.notes && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.notes.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showSalesPerson && (
                    <div>
                      <span>
                        <h3 className="mb-1">Sales Details</h3>
                      </span>
                      <div className="form-group row mt-3">
                        <label
                          htmlFor="salesPerson"
                          className="col-sm-2 text-right control-label col-form-label"
                        >
                          Sales Person
                        </label>
                        <div className="col-sm-9 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="salesPerson"
                            placeholder="Enter Sales Person Name"
                            {...register("salesPerson", {
                              required: "Sales Person Name is required",
                              validate: (value) =>
                                noTrailingSpaces(value, "salesPerson"),
                              maxLength: {
                                value: 100,
                                message:
                                  "Sales Person Name cannot exceed 100 characters",
                              },
                            })}
                            onChange={(e) => handleInputChange(e, "salesPerson")}
                            onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                          />
                          {errors.salesPerson && (
                            <p
                              className="errorMsg"
                              style={{ marginLeft: "6px", marginBottom: "0" }}
                            >
                              {errors.salesPerson.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {templateFields.showShippingMethod && (
                    <div className="form-group row">
                      <label
                        htmlFor="shippingMethod"
                        className="col-sm-2 text-right control-label col-form-label"
                      >
                        Shipping Method
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="shippingMethod"
                          placeholder="Enter Shipping Method"
                          {...register("shippingMethod", {
                            required: "Shipping Method is required",
                            validate: (value) =>
                              noTrailingSpaces(value, "shippingMethod"),
                            maxLength: {
                              value: 100,
                              message:
                                "Shipping Method cannot exceed 100 characters",
                            },
                          })}
                          onChange={(e) => handleInputChange(e, "shippingMethod")}
                          onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                        />
                        {errors.shippingMethod && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.shippingMethod.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showShippingTerms && (
                    <div className="form-group row">
                      <label
                        htmlFor="shippingTerms"
                        className="col-sm-2 text-right control-label col-form-label"
                      >
                        Shipping Terms
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="shippingTerms"
                          placeholder="Enter Shipping Terms"
                          {...register("shippingTerms", {
                            required: "Shipping Terms are required",
                            validate: (value) =>
                              noTrailingSpaces(value, "shippingTerms"),
                            maxLength: {
                              value: 100,
                              message:
                                "Shipping Terms cannot exceed 100 characters",
                            },
                          })}
                          onChange={(e) => handleInputChange(e, "shippingTerms")}
                          onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                        />
                        {errors.shippingTerms && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.shippingTerms.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showPaymentTerms && (
                    <div className="form-group row">
                      <label
                        htmlFor="paymentTerms"
                        className="col-sm-2 text-right control-label col-form-label"
                      >
                        Payment Terms
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="paymentTerms"
                          placeholder="Enter Payment Terms"
                          {...register("paymentTerms", {
                            required: "Payment Terms are required",
                            validate: (value) =>
                              noTrailingSpaces(value, "paymentTerms"),
                            maxLength: {
                              value: 100,
                              message:
                                "Payment Terms cannot exceed 100 characters",
                            },
                          })}
                          onChange={(e) => handleInputChange(e, "paymentTerms")}
                          onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                        />
                        {errors.paymentTerms && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.paymentTerms.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showDeliveryDate && (
                    <div className="form-group row">
                      <label
                        htmlFor="deliveryDate"
                        className="col-sm-2 text-right control-label col-form-label"
                      >
                        Delivery Date
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="date"
                          className="form-control"
                          id="deliveryDate"
                          onClick={(e) => e.target.showPicker()}
                          {...register("deliveryDate", {
                            required: "Delivery Date is required",

                            validate: (value) => {
                              const invoiceDate = watch("invoiceDate");
                              if (!invoiceDate) {
                                return "Invoice Date is required before selecting Delivery Date";
                              }
                              const invoiceDateObj = new Date(invoiceDate);
                              const deliveryDateObj = new Date(value);
                              if (deliveryDateObj < invoiceDateObj) {
                                return "Delivery Date cannot be before Invoice Date";
                              }
                              return true;
                            },
                          })}
                        />
                        {errors.deliveryDate && (
                          <p className="errorMsg">
                            {errors.deliveryDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      type="button"
                      className="btn btn-primary mb-2"
                      onClick={addColumn}
                    >
                      Add Column
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary mb-2 ms-2"
                      onClick={addRow}
                    >
                      Add Row
                    </button>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          {productColumns.map((col) => (
                            <th key={col.key} className="position-relative">
                              {col.key !== "totalCost" && (
                                <button
                                  type="button"
                                  className="btn btn-sm position-absolute top-0 end-0"
                                  onClick={() => handleDeleteColumn(col.key)}
                                  style={{ fontSize: "10px" }}
                                >
                                  ❌
                                </button>
                              )}
                              <input
                                type="text"
                                className="form-control mb-1"
                                value={col.title}
                                onChange={(e) => updateColumnTitle(col.key, e.target.value)}
                                disabled={col.key === "totalCost"}
                              />
                              <select
                                className="form-select form-select-sm"
                                value={col.type}
                                onChange={(e) => updateColumnType(col.key, e.target.value)}
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="percentage">%</option>
                              </select>
                            </th>
                          ))}
                          <th style={{ paddingBottom: "35px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {productColumns.map((col) => {
                              const validation = getProductFieldValidation(col);
                              const value = row[col.key] || "";
                              let errorMsg = "";

                              // Show min/max errors while typing, but required error only after submit
                              if (col.key !== "totalCost") {
                                const stringValue = value != null ? String(value) : "";

                                if (stringValue.length > 0) {
                                  if (validation.minLength && stringValue.length < validation.minLength.value) {
                                    errorMsg = validation.minLength.message;
                                  } else if (validation.maxLength && stringValue.length > validation.maxLength.value) {
                                    errorMsg = validation.maxLength.message;
                                  }
                                } else if (showValidations) {
                                  errorMsg = `${col.title} is required`;
                                }
                              }


                              return (
                                <td key={col.key}>
                                  <input
                                    type={col.type === "percentage" ? "text" : col.type}
                                    className={`form-control ${errorMsg && col.key !== "totalCost" ? "is-invalid" : ""}`}
                                    value={value}
                                    onChange={(e) => updateData(rowIndex, col.key, e.target.value)}
                                    disabled={col.key === "totalCost"}
                                  />
                                  {errorMsg && col.key !== "totalCost" && (
                                    <div className="invalid-feedback">{errorMsg}</div>
                                  )}
                                </td>
                              );
                            })}
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteRow(rowIndex)}
                              >
                                Delete Row
                              </button>
                            </td>
                          </tr>
                        ))}
                        {productError && (
                          <tr>
                            <td colSpan={productColumns.length + 1}>
                              <div className="alert alert-danger mb-0 py-2">
                                {productError}
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={productColumns.length - 1} className="text-end">
                            <strong>Sub Total(₹):</strong>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={subTotal.toFixed(2)}
                              readOnly
                            />
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                    <DeletePopup
                      show={showDeleteModal}
                      handleClose={handleCloseDeleteModal}
                      handleConfirm={() => handleConfirmDelete(selectedItemId)}
                      id={selectedItemId}
                      pageName="Field"
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mb-3 me-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClearForm}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={load}
                  >
                    {load ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
              {showPreview && (
                <div
                  className="modal"
                  style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1050,
                    overflow: "auto",
                  }}
                >
                  <div
                    className="modal-dialog modal-xl"
                    style={{
                      maxWidth: "90%",
                      margin: "30px auto",
                    }}
                  >
                    <div
                      className="modal-content"
                      style={{
                        border: "none",
                        borderRadius: "0.3rem",
                      }}
                    >
                      <div
                        className="modal-header"
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          padding: "1rem",
                        }}
                      >
                        <h5 className="modal-title">Invoice Preview</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => {
                            setShowPreview(false);
                            setPreviewData(null);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          &times;
                        </button>
                      </div>
                      <div
                        className="modal-body"
                        style={{
                          padding: "0",
                          overflow: "auto",
                          maxHeight: "calc(100vh - 200px)",
                        }}
                      >
                        {previewData && (
                          <InvoicePreview
                            previewData={previewData}
                            selectedTemplate={selectedTemplate}
                          />
                        )}
                      </div>
                      <div
                        className="modal-footer"
                        style={{
                          borderTop: "1px solid #dee2e6",
                          padding: "1rem",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowPreview(false);
                            setPreviewData(null);
                          }}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleConfirmSubmission}
                        >
                          Confirm Submission
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default InvoiceRegistration;
