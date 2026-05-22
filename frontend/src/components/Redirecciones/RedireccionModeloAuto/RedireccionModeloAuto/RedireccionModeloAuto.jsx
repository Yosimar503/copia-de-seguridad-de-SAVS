import React from "react";
import { useRedireccionModeloAutoLogica } from "./RedireccionModeloAutoLogica";
import { Calculator } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
import "./DiseñoRedireccion.css";

function RedireccionModeloAuto() {
  const { autos, loading, filtros, handleFiltroChange, limpiarFiltros } = useRedireccionModeloAutoLogica();
  const navigate = useNavigate();

  return (

<div className="pagina">

{/* HEADER */}

<header className="navbar">

<div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🚗 GESTIONADORA</div>

<nav style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
<Link to="/">Inicio</Link>
<Link to="/inventory">Vehículos</Link>
<Link to="#" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
<Calculator size={18} /> Simular Crédito
</Link>
<Link to="/contact">Contacto</Link>
</nav>

<button className="loginBtn" onClick={() => navigate('/login')}>Iniciar Sesión</button>

</header>


{/* TITULO */}

<section className="headerCatalogo">

<p className="subtitulo">CATÁLOGO EXCLUSIVO</p>

<h1>Vehículos disponibles</h1>

<p className="resultado">Resultados encontrados: <b>{autos.length}</b></p>

</section>


{/* CONTENIDO */}

<div className="contenido">

{/* FILTROS */}

<aside className="filtros">

<h3>Filtrar búsqueda</h3>

<select name="año" value={filtros.año} onChange={handleFiltroChange}>
<option value="">Cualquier Año</option>
<option value="2024">2024</option>
<option value="2023">2023</option>
<option value="2022">2022</option>
<option value="2021">2021</option>
</select>

<input type="text" name="marca" value={filtros.marca} onChange={handleFiltroChange} placeholder="Marca (ej. Toyota)" />

<input type="text" name="modelo" value={filtros.modelo} onChange={handleFiltroChange} placeholder="Modelo (ej. Corolla)"/>

<input type="number" name="precioMin" value={filtros.precioMin} onChange={handleFiltroChange} placeholder="Precio mínimo"/>

<input type="number" name="precioMax" value={filtros.precioMax} onChange={handleFiltroChange} placeholder="Precio máximo"/>

<select name="transmision" value={filtros.transmision} onChange={handleFiltroChange}>
<option value="">Cualquier Transmisión</option>
<option value="Automática">Automática</option>
<option value="Manual">Manual</option>
<option value="CVT">CVT</option>
</select>

<select name="combustible" value={filtros.combustible} onChange={handleFiltroChange}>
<option value="">Cualquier Combustible</option>
<option value="Gasolina">Gasolina</option>
<option value="Diésel">Diésel</option>
<option value="Eléctrico">Eléctrico</option>
<option value="Híbrido">Híbrido</option>
</select>

<button className="btnFiltro" onClick={limpiarFiltros} style={{background: '#6b7280', marginTop: '10px'}}>Limpiar filtros</button>

</aside>


{/* AUTOS */}

<section className="autos">

{loading ? (
  <p style={{textAlign: 'center', width: '100%'}}>Cargando vehículos...</p>
) : autos.length === 0 ? (
  <p style={{textAlign: 'center', width: '100%'}}>No se encontraron vehículos.</p>
) : (
autos.map(auto => (

<div className="cardAuto" key={auto.id}>

<div className="imgContainer">

{auto.tag && <span className="badge" style={{backgroundColor: auto.tagColor}}>{auto.tag}</span>}

<img src={auto.image} alt="auto" style={{objectFit: 'cover'}}/>

</div>

<div className="infoAuto">

<h3>{auto.name}</h3>

<p className="año">{auto.year}</p>

<div className="datos">

<span>{auto.mileage}</span>

<span>{auto.transmission}</span>

</div>

<p className="estado">{auto.fuel}</p>

<div className="precioRow">

<h2>₡{auto.price.toLocaleString('es-CR')}</h2>

<button className="btnDetalles" onClick={() => navigate(`/vehicle/${auto.id}`, { state: { vehicle: auto } })}>
Ver Detalles
</button>

</div>

</div>

</div>

)))}

</section>

</div>


{/* FOOTER */}



</div>
)

}

export default RedireccionModeloAuto
