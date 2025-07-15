import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import LayOut from "../LayOut/LayOut";
import Loader from "../Utils/Loader";

const EmployeeList = () => {
    const { status } = useParams(); // 'active' or 'Relieved'
    const employees = useSelector((state) => state.employees.data);
    const employeesStatus = useSelector((state) => state.employees.status);
    const [search, setSearch] = useState("");
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const customStyles = {
        headCells: {
            style: {
                fontSize: '16px',
                fontWeight: '600',
            },
        },
        cells: {
            style: {
                fontSize: '15px',
            },
        },
    };

    useEffect(() => {
        if (employeesStatus === 'succeeded') {
            const filtered = employees.filter(
                (emp) =>
                    emp.status?.toLowerCase() === status.toLowerCase() &&
                    (`${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(search.toLowerCase()))
            );
            setFilteredEmployees(filtered);
        }
    }, [status, employees, search, employeesStatus]);

    const columns = [
        {
            name: <strong>S.No</strong>,
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            width: "70px",
        },
        {
            name: <strong>Name</strong>,
            selector: (row) => `${row.firstName} ${row.lastName || ""}`,
            width: "180px",
        },
        {
            name: <strong>Email</strong>,
            selector: (row) => row.emailId,
            width: "300px",
        },
        {
            name: <strong>Department</strong>,
            selector: (row) => row.departmentName,
            width: "230px",
        },
        {
            name: <strong>Designation</strong>,
            selector: (row) => row.designationName,
            width: "230px",
        },
    ];

    if (employeesStatus === 'loading') return <Loader />;
    if (employeesStatus === 'failed') return <LayOut><div className="alert alert-danger">Failed to load employees</div></LayOut>;

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="fs-3 mb-3 fw-bold text-dark">
                            {status} Employees : {filteredEmployees.length}
                        </h1>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4 offset-md-8">
                        <input
                            type="search"
                            className="form-control fs-5"
                            placeholder="Search Employee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        {filteredEmployees.length > 0 ? (
                            <DataTable
                                columns={columns}
                                data={filteredEmployees}
                                pagination
                                paginationPerPage={rowsPerPage}
                                onChangePage={(page) => setCurrentPage(page)}
                                onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
                                customStyles={customStyles}
                            />
                        ) : (
                            <div className="text-center py-5">
                                <h4>No {status.toLowerCase()} employees found</h4>
                                {search && (
                                    <p>Try adjusting your search term</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LayOut>
    );
};

export default EmployeeList;