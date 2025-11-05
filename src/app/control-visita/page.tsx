import SupportDashboard from "@/component/SupportDashboard";

const ControlVisitaPage = () => {
  return (
    <SupportDashboard
      apiUrl="https://sheetdb.io/api/v1/203wk74l267nw"
      labels={{
        headerTitle: "Control de Visitas",
        tecnico:"Encargado/a"
      }}
    />
  );
};

export default ControlVisitaPage;
