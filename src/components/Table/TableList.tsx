import React, { useContext, useEffect, useState } from "react";
import { Button, Space, Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import qs from "qs";
import { DeleteOutlined } from "@ant-design/icons";
import AsyncConfirm from "../drawer/AsyncConfirm";
import DrawerContext from "../../context/DrawerContext";
import { useNavigate } from "react-router-dom";

interface DataType {
  name: {
    first: string;
    last: string;
  };
  gender: string;
  email: string;
  login: {
    uuid: string;
  };
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

const getRandomuserParams = (params: TableParams) => ({
  results: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
});

const TableList: React.FC = () => {
  const [data, setData] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const { asyncconfirmopen, setAsyncConfirmOpen } = useContext(DrawerContext);

  const navigate=useNavigate()

  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
      render: (name) => `${name.first} ${name.last}`,
      width: "20%",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      filters: [
        { text: "Male", value: "male" },
        { text: "Female", value: "female" },
      ],
      width: "20%",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={()=>navigate("2")} type="primary">Info</Button>
          <DeleteOutlined style={{ fontSize: "26px",color: 'red' }} onClick={() => setAsyncConfirmOpen(true)} />
        </Space>
      ),
    },
  ];

  const fetchData = () => {
    setLoading(true);
    fetch(
      `https://randomuser.me/api?${qs.stringify(
        getRandomuserParams(tableParams)
      )}`
    )
      .then((res) => res.json())
      .then(({ results }) => {
        setData(results);
        setLoading(false);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: 200,
            // 200 is mock data, you should read it from server
            // total: data.totalCount,
          },
        });
      });
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams)]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<DataType> | SorterResult<DataType>[]
  ) => {
    setTableParams({
      pagination,
      filters: filters as Record<string, FilterValue>, // Cast filters as Record<string, FilterValue>
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  return (
    <Table
      className="w-full overflow-x-auto"
      columns={columns}
      rowKey={(record) => record.login.uuid}
      dataSource={data}
      pagination={tableParams.pagination}
      loading={loading}
      onChange={handleTableChange}
    />
  );
};

export default TableList;
