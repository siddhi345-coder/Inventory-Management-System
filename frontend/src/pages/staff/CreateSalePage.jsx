import Layout from "../../components/layout/Layout";
import CreateSaleForm from "../../components/sales/CreateSaleForm";

export default function CreateSalePage() {
  return (
    <Layout>
      <div className="page-header">
        <h1>Create New Sale</h1>
        <p>Add products to cart and complete the sale</p>
      </div>
      <CreateSaleForm />
    </Layout>
  );
}
