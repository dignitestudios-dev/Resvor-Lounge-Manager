import React from "react";
import Table from "@/components/bartenders-requests/Table";

const BartenderRequest = () => {
  return (
    <div>
      <h1 className="section-heading">Bartenders Requests</h1>

      <div className="mt-10">
        <Table />
      </div>
    </div>
  );
};

export default BartenderRequest;
