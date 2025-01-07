interface ShowOnMapButtonProps {
  lat: number;
  lng: number;
  className?: string;
}

const ShowOnMapButton = ({ lat, lng, className }: ShowOnMapButtonProps) => {
  return (
    <button
      onClick={() =>
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
      }
      className={className}
    >
      <span className="material-icons">location_on</span>
      <span>Haritada Göster</span>
    </button>
  );
};

export default ShowOnMapButton;
