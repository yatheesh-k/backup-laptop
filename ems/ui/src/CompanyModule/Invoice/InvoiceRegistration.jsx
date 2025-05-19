import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import LayOut from "../../LayOut/LayOut";
import { fetchCustomers } from "../Redux/CustomerSlice";
import { useAuth } from "../../Context/AuthContext";
import { fetchProducts } from "../Redux/ProductSlice";
import { InvoicePostApi } from "../../Utils/Axios";
import { selectProducts, selectCustomers } from "../Redux/Store"; // Selectors for loading states

const InvoiceRegistration = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  // Select data from Redux store
  // const customers = useSelector(selectCustomers) || []; // Ensure it's an array
  //const products = useSelector(selectProducts);
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);
  const { products } = useSelector((state) => state.products);

  console.log("products", products);
  const [invoiceData, setInvoiceData] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const companyId = user.companyId;
  console.log("companyId", companyId);

  const [productsInfo, setProductsInfo] = useState([
    {
      productName: "",
      hsnNo: "",
      purchaseDate: "",
      quantity: "",
      productCost: "",
    },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceId, setInvoiceId] = useState(null); // to handle edit case
  const [load, setLoad] = useState(false); // to manage loading state for API calls
  const [customer, setCustomer] = useState(customers); // List of customers for the dropdown
  const [product, setProduct] = useState(products);
  const [formattedProducts, setFormattedProducts] = useState(products);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("customer", customer);
  console.log("product", product);

  console.log("formattedProducts", formattedProducts);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchProducts());
  }, [dispatch]);

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

  console.log("this is from product options ", formattedProducts);

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
    if (companyId) {
      dispatch(fetchProducts(companyId));
    }
  }, [dispatch, companyId]);

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

  // Function to auto-generate invoice number
  //   const generateInvoiceNumber = () => {
  //     const currentDate = moment().format('YYYYMMDD');
  //     const randomSuffix = Math.floor(Math.random() * 10000);
  //     return `${currentDate}-${randomSuffix}`;
  //   };

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

  console.log("this is from customers options ", customer);

  const handleProductChange = (selectedOption, index) => {
    console.log("Selected Product:", selectedOption);

    if (!selectedOption || !selectedOption.productCost) {
      console.error(
        "Selected product does not have productCost",
        selectedOption
      );
      return;
    }

    const purchaseDate = getValues(`productsInfo[${index}].purchaseDate`);
    const quantity = getValues(`productsInfo[${index}].quantity`);

    const updatedProductsInfo = [...productsInfo];
    updatedProductsInfo[index] = {
      ...updatedProductsInfo[index],
      productId: selectedOption.value, // Product ID
      productName: selectedOption.label, // Product Name
      hsnNo: selectedOption.hsnNo, // HSN No
      productCost: selectedOption.productCost, // Product Cost
      purchaseDate: purchaseDate,
      quantity: quantity,
    };

    setProductsInfo(updatedProductsInfo);

    // Update React Hook Form values for product details
    setValue(`productsInfo[${index}].productName`, selectedOption.label);
    setValue(`productsInfo[${index}].hsnNo`, selectedOption.hsnNo);
    setValue(`productsInfo[${index}].productCost`, selectedOption.productCost);
    setValue(`productsInfo[${index}].purchaseDate`, purchaseDate); // Empty initially
    setValue(`productsInfo[${index}].quantity`, quantity); // Empty initially

    console.log("Updated Products Info:", updatedProductsInfo);
  };

  // Function to set default invoice date
  //   const getDefaultInvoiceDate = () => {
  //     return moment().format('YYYY-MM-DD');
  //   };

  const onSubmit = async (data) => {
    console.log("InvoiceRegdata", data);
    console.log("productsInfo", data.productsInfo); // Ensure this has purchaseDate, quantity, and productId

    setLoad(true);

    try {
      const customerId = data.customerName.value;

      // Prepare the orderRequests payload
      const orderRequests = data.productsInfo.map((product) => {
        // Ensure the product has all necessary fields
        return {
          productId: product.productId || "", // Ensure productId is passed (set default if undefined)
          hsnNo: product.hsnNo || "", // Ensure hsnNo is passed
          purchaseDate: product.purchaseDate || "", // Ensure purchaseDate is passed
          quantity: product.quantity || "", // Ensure quantity is passed
        };
      });

      const invoiceDataToSend = {
        customerName: data.customerName.label,
        purchaseOrder: data.purchaseOrder,
        vendorCode: data.vendorCode,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        orderRequests: orderRequests, // Pass the prepared orderRequests array
        status: "Active",
      };

      console.log("invoiceDataToSend", invoiceDataToSend); // Verify purchaseDate, quantity, and productId are included here

      const response = await InvoicePostApi(
        companyId,
        customerId,
        invoiceDataToSend
      );

      toast.success("Invoice created successfully", {
        position: "top-right",
        autoClose: 1000,
      });
      navigate("/invoiceView");
      setInvoiceData({
        ...data,
        product_details: data.productsInfo, // Ensure product details are included
      });

      setShowPreview(true); // Show preview on successful submission
    } catch (error) {
      toast.error("Failed to save invoice", {
        position: "top-right",
        autoClose: 1000,
      });
    } finally {
      setLoad(false); // Hide loading state
    }
  };

  // // Automatically populate invoice number and date if they are not provided
  useEffect(() => {
    if (!invoiceId) {
      // Set default invoice number and date on new invoice creation
      // setValue("invoiceNumber", generateInvoiceNumber());
      // setValue("invoiceDate", getDefaultInvoiceDate());
    }
  }, [invoiceId, setValue]);

  const togglePreview = (e) => {
    e.preventDefault();
    setShowPreview(true);
  };

  // // For managing the products dynamically
  const AddProductsInfo = () => {
    setProductsInfo([
      ...productsInfo,
      {
        productId: "",
        hsnNo: "",
        purchaseDate: "",
        quantity: "",
        productCost: "",
      },
    ]);
  };

  const handleDelete = (index) => {
    const updatedProducts = [...productsInfo];
    updatedProducts.splice(index, 1);
    setProductsInfo(updatedProducts);
  };

  const allowNumbersOnly = (e) => {
    if (!/^[1-9\s]*$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    // <div id="main-wrapper" data-sidebartype="mini-sidebar">
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Registration</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Registration</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  Invoice
                </h5>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#d7d9dd" }}
                />
              </div>
              <form
                className="form-horizontal"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="card-body">
                  <h4 className="ml-3" style={{ marginTop: "20px" }}>
                    <b>Invoice Details</b>
                  </h4>

                  {/* Customer Name Dropdown */}
                  <div className="form-group row mt-5">
                    <label
                      htmlFor="customer"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Customer Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <Controller
                        name="customerName"
                        id="customerName"
                        control={control}
                        rules={{ required: "Customer Name is required" }} // Mandatory validation rule
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
                    </div>
                    {errors.customerName && (
                      <p className="errorMsg" style={{ marginLeft: "170px" }}>
                        {errors.customerName.message}
                      </p> // Display error message
                    )}
                  </div>

                  {/* Vendor Code */}
                  <div className="form-group row">
                    <label
                      htmlFor="vendorCode"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Vendor Code<span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        name="vendorCode"
                        id="vendorCode"
                        placeholder="Enter Vendor Code"
                        {...register("vendorCode", {
                          required: "Vendor Code is required", // Make the field required with a custom error message
                        })}
                      />
                    </div>
                    {errors.vendorCode && (
                      <p className="errorMsg" style={{ marginLeft: "170px" }}>
                        {errors.vendorCode.message}
                      </p> // Display the error message if validation fails
                    )}
                  </div>

                  {/* purchase order */}
                  <div className="form-group row">
                    <label
                      htmlFor="purchaseOrder"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Purchase Order<span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        name="purchaseOrder"
                        id="purchaseOrder"
                        placeholder="Enter Purchase Order"
                        {...register("purchaseOrder", {
                          required: "Enter Purchase Order",
                        })}
                        onKeyPress={allowNumbersOnly}
                      />
                    </div>
                    {errors.purchaseOrder && (
                      <p className="errorMsg" style={{ marginLeft: "170px" }}>
                        {errors.purchaseOrder.message}
                      </p> // Display the error message if validation fails
                    )}
                  </div>
                  <div className="form-group row">
                    <label
                      htmlFor="invoiceDate"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Due Date<span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="date"
                        className="form-control"
                        name="dueDate"
                        id="dueDate"
                        {...register("dueDate", {
                          required: "Due date is required",
                          validate: {
                            notPast: (value) => {
                              const today = new Date();
                              const selectedDate = new Date(value);
                              // Check if the selected date is today or in the future
                              return (
                                selectedDate >= today ||
                                "Due date cannot be in the past."
                              );
                            },
                          },
                        })}
                      />
                    </div>
                    {errors.dueDate && (
                      <p className="errorMsg" style={{ marginLeft: "170px" }}>
                        {errors.dueDate.message}
                      </p> // Display the error message if validation fails
                    )}
                  </div>
                  {/* Invoice Number */}
                  {/* <div className="form-group row">
                    <label
                      htmlFor="invoiceNumber"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Invoice Number
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="invoiceNumber"
                        name="invoiceNumber"
                        {...register("invoiceNumber", {
                          required: "Invoice number is required",
                        })}
                      />
                    </div>
                    {errors.invoiceNumber && (
                      <p className="errorMsg">{errors.invoiceNumber.message}</p>
                    )}
                  </div> */}

                  {/* Invoice Date */}
                  <div className="form-group row">
                    <label
                      htmlFor="invoiceDate"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Invoice Date<span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="date"
                        className="form-control"
                        name="invoiceDate"
                        id="invoiceDate"
                        {...register("invoiceDate", {
                          required: "Invoice date is required",
                        })}
                      />
                    </div>
                    {errors.invoiceDate && (
                      <p className="errorMsg" style={{ marginLeft: "170px" }}>
                        {errors.invoiceDate.message}
                      </p>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <h4 className="ml-3" style={{ marginTop: "20px" }}>
                        <b>Product Details</b>
                      </h4>
                    </div>
                    <div className="col-sm-6">
                      <div className="card-body">
                        <button
                          type="button"
                          onClick={AddProductsInfo}
                          className="btn btn-secondary"
                          style={{ marginLeft: "63%" }}
                        >
                          Add More{" "}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-sm-12">
                      {productsInfo &&
                        productsInfo.length > 0 &&
                        productsInfo.map((item, index) => (
                          <div key={index} className="row">
                            <div className="form-group col-sm-2 ml-2 mt-2">
                              <div className="row">
                                <label
                                  htmlFor="productId"
                                  className="text-right control-label col-form-label pb-2"
                                >
                                  Product Name
                                  <span style={{ color: "red" }}>*</span>
                                </label>
                              </div>
                              <Controller
                                name={`productsInfo[${index}].productId`}
                                control={control}
                                rules={{ required: "Product is required" }}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={formattedProducts}
                                    value={
                                      formattedProducts.find(
                                        (product) =>
                                          product.value === field.value
                                      ) || null
                                    } // Find the selected product by matching value
                                    onChange={(selectedOption) => {
                                      handleProductChange(
                                        selectedOption,
                                        index
                                      );
                                      field.onChange(
                                        selectedOption
                                          ? selectedOption.value
                                          : null
                                      ); // Pass only productId (value)
                                    }}
                                    getOptionLabel={(e) => e.label}
                                    getOptionValue={(e) => e.value}
                                  />
                                )}
                              />
                            </div>
                            <div className="form-group col-sm-2 ml-2 mt-2">
                              <label
                                htmlFor={`hsnNo-${index}`}
                                className="text-right control-label col-form-label"
                              >
                                HSN No
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id={`hsnNo-${index}`}
                                name={`productsInfo[${index}].hsnNo`}
                                value={productsInfo[index]?.hsnNo || ""}
                                {...register(`productsInfo[${index}].hsnNo`)}
                                readOnly
                              />
                            </div>

                            <div className="form-group col-sm-2 ml-2 mt-2">
                              <label
                                htmlFor={`purchaseDate-${index}`}
                                className="text-right control-label col-form-label"
                              >
                                Purchase Date
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                className="form-control"
                                id={`purchaseDate-${index}`}
                                name={`productsInfo[${index}].purchaseDate`}
                                type="date"
                                {...register(
                                  `productsInfo[${index}].purchaseDate`,
                                  {
                                    required: "Purchase Date is required",
                                  }
                                )}
                              />
                            </div>

                            <div className="form-group col-sm-2 ml-2 mt-2">
                              <label
                                htmlFor={`quantity-${index}`}
                                className="text-right control-label col-form-label"
                              >
                                Quantity
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                className="form-control"
                                id={`quantity-${index}`}
                                name={`productsInfo[${index}].quantity`}
                                type="text"
                                placeholder="Enter Quantity"
                                maxLength={4}
                                {...register(
                                  `productsInfo[${index}].quantity`,
                                  {
                                    required: "Quantity is required",
                                  }
                                )}
                                onKeyPress={allowNumbersOnly}
                              />
                            </div>

                            <div className="form-group col-sm-2 ml-2 mt-2">
                              {errors.productsInfo?.[index]?.productCost && (
                                <p className="errorMsgs">*</p>
                              )}
                              <label
                                htmlFor={`productCost-${index}`}
                                className=" text-right control-label col-form-label"
                              >
                                Cost
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                id={`productCost-${index}`}
                                name={`productsInfo[${index}].productCost`}
                                value={productsInfo[index]?.productCost || ""}
                                {...register(
                                  `productsInfo[${index}].productCost`
                                )}
                                readOnly
                              />
                            </div>

                            <div
                              className="form-group col-sm-2 ml-2"
                              style={{ marginTop: "40px" }}
                            >
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDelete(index)}
                              >
                                Delete
                              </button>
                            </div>
                            {errors?.productsInfo?.[index]?.productId && (
                              <p className="errorMsg">
                                {errors.productsInfo[index].productId.message}
                              </p>
                            )}
                            {errors?.productsInfo?.[index]?.purchaseDate && (
                              <p
                                className="errorMsg"
                                style={{ marginLeft: "333px" }}
                              >
                                {
                                  errors.productsInfo[index].purchaseDate
                                    .message
                                }
                              </p>
                            )}
                            {errors?.productsInfo?.[index]?.quantity && (
                              <p
                                className="errorMsg"
                                style={{ marginLeft: "500px" }}
                              >
                                {errors.productsInfo[index].quantity.message}{" "}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginLeft: "90%" }}
                    disabled={load}
                  >
                    {load ? "submitting..." : "submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default InvoiceRegistration;
