export const generateSections = (
  category: string
) => {
  switch (category) {

    case "Finance":
      return {
        features: [
          "Investment Advisory",
          "Capital Raising",
          "Risk Management"
        ],
        stats: [
          "500M+ Managed",
          "120 Clients",
          "15 Years Experience"
        ]
      };

    case "Medical":
      return {
        features: [
          "Online Appointments",
          "Telemedicine",
          "Medical Records"
        ]
      };

    default:
      return {};
  }
};