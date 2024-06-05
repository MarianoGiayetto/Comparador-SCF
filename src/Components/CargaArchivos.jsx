import CloudUploadIcon from "@mui/icons-material/CloudUpload";
/* import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckIcon from '@mui/icons-material/Check'; */
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { XMLParser } from "fast-xml-parser";
import React, { useState , useRef} from "react";
import { AppBar } from "@mui/material";
import {ThemeProvider, createTheme} from "@mui/material/styles";
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
/* import TableContainer from "@mui/material/TableContainer"; */
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from '@mui/material/Divider';
import { blue } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4791DB',
      light: '#515154',
      dark: '#115293',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      paper: blue[50]
      ,
    },
  },
});

const CargaArchivos = () => {
  const [jsonResults, setJsonResults] = useState([null, null]);
  const [errors, setErrors] = useState([null, null]);
  const fileInputRefs = [useRef(null), useRef(null)];

  const handleFileUpload = (event, fileIndex) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const xmlContent = e.target.result;
        try {
          const options = {
            attributeNamePrefix: "",
            ignoreAttributes: false, // No ignorar atributos
            parseNodeValue: true, // Parsear valores de nodo
            trimValues: true,
            textNodeName: "value",
          };
          const parser = new XMLParser(options);
          const result = parser.parse(xmlContent);
          setJsonResults((prevState) => {
            const newResults = [...prevState];
            newResults[fileIndex] = result;
            return newResults;
          });
        } catch (err) {
          setErrors((prevState) => {
            const newErrors = [...prevState];
            newErrors[fileIndex] = "Error parsing XML";
            return newErrors;
          });
          console.error(err);
        }
      };
      reader.onerror = (e) => {
        setErrors((prevState) => {
          const newErrors = [...prevState];
          newErrors[fileIndex] = "Error reading file";
          return newErrors;
        });
        console.error(e);
      };
      reader.readAsText(file);
    }
  };
  const handleClear = () => {
    setJsonResults([null, null]);
    setErrors([null, null]);
    fileInputRefs.forEach(ref => {
      if (ref.current) {
        ref.current.value = ''
      }
    })
  };

  const extraerValores = (json, nombresPropiedades) => {
    if (!json) return [];

    const results = {}
    const propNamesArray = Array.isArray(nombresPropiedades) ? nombresPropiedades : [nombresPropiedades]

    propNamesArray.forEach(nombrePropiedad => {
      results[nombrePropiedad] = []
    })

    const extraerValorDeObjeto = (obj) => {
      if (typeof obj === "object") {
        for (const key in obj) {
          if (key === "p") {      
            if (Array.isArray(obj[key])) {
              obj[key].forEach(item =>{
                if (nombresPropiedades.includes(item.name)){
                  results[item.name].push(item.value)
                }
              })
            } else if (typeof obj[key] === "object") {
              if (nombresPropiedades.includes(obj[key].name)) {
                results[obj[key].name].push(obj[key].value);
              }
            }
          } else if (typeof obj[key] === "object") {
            extraerValorDeObjeto(obj[key]);
          }
        }
      }
    };
    extraerValorDeObjeto(json);
    return results;
  };

  const valoresAsociados = (json) => {
    if (!json) return []
    const asociaciones = []
    const managedObjects = json?.raml?.cmData?.managedObject || []
    managedObjects.forEach(mo => {
      if (mo.class.includes('ETHLK')){
        const eif = {
          connectorLabel: '',
          administrativeState: '',
          speedAndDuplex: '',
        };
        mo.p.forEach(p => {
          if (p.name === 'connectorLabel') eif.connectorLabel = p.value;
          if (p.name === 'administrativeState') eif.administrativeState = p.value;
          if (p.name === 'speedAndDuplex') eif.speedAndDuplex = p.value;
        });
        asociaciones.push(eif);
      }
    })
    return asociaciones
  }

  const asociaciones1 = valoresAsociados(jsonResults[0])
  const asociaciones2 = valoresAsociados(jsonResults[1])
  
  const commonLength = Math.max(asociaciones1.length, asociaciones2.length)
  const safeValue = (value) => (value === undefined || value === null ? '-': value)

  const mostrarTabla = jsonResults[0] && jsonResults[1];

  const compararValores = (valor1, valor2) => {
    if (valor1 === valor2){
      return <CheckIcon color="success" />
    }else{
      return <CloseIcon color="error" />
    }
  }

  return (
    <>
      <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Comparador SCF BOIR
          </Typography>
        </Toolbar>        
      </AppBar>
      
      <Stack  direction={{ xs: 'column', sm: 'row' }} justifyContent='center' spacing={{ xs: 1, sm: 2, md: 4 }} margin={2}>
        <Box>
          <Button startIcon={<CloudUploadIcon />} component="label" variant="contained">
            <input type="file" accept=".xml" onChange={(e) => handleFileUpload(e, 0)} ref={fileInputRefs[0]} hidden></input>
            {errors[0] && <p style={{ color: 'red' }}>{errors[0]}</p>}
            Subir archivo 1
          </Button>
        </Box>
        <Box>
          <Button startIcon={<CloudUploadIcon />} component="label" variant="contained">
            <input type="file" accept=".xml" onChange={(e) => handleFileUpload(e, 1)} ref={fileInputRefs[1]} hidden></input>
            {errors[1] && <p style={{ color: 'red' }}>{errors[1]}</p>}
            Subir archivo 2
          </Button>
        </Box>
        <Box>
          <Button startIcon={<CloudUploadIcon />} component="label" variant="contained"><input onClick={handleClear} hidden></input>
            Limpiar
          </Button>
        </Box>
        </Stack>

        <Divider />
        
        <Table stickyHeader component={Paper} elevation={4} sx={{marginTop:'10px',  width: '90%', mx: 'auto'  }} >
          <TableHead>
            <TableRow >
              <TableCell sx={{fontWeight:'bold', backgroundColor: '#b3e5fc', fontSize:'15px'}}>Parámetros</TableCell>
              <TableCell sx={{fontWeight:'bold', backgroundColor: '#b3e5fc', fontSize:'15px'}}align="center">Archivo 1:  {JSON.stringify(extraerValores(jsonResults[0], ['btsName']).btsName?.[0])}</TableCell>
              <TableCell sx={{fontWeight:'bold', backgroundColor: '#b3e5fc', fontSize:'15px'}}align="center">Archivo 2:  {JSON.stringify(extraerValores(jsonResults[1], ['btsName']).btsName?.[0])}</TableCell>
              <TableCell sx={{fontWeight:'bold', backgroundColor: '#b3e5fc', fontSize:'15px'}}align="center">Comparación</TableCell>
            </TableRow>
          </TableHead>
          {mostrarTabla && (
          <TableBody>
           {Array.from({ length: commonLength }).map((_, index) => (
              <React.Fragment key={index}>
                <TableRow >
                  <TableCell >connectorLabel</TableCell>
                  <TableCell align="center">{safeValue(asociaciones1[index]?.connectorLabel)}</TableCell>
                  <TableCell align="center">{safeValue(asociaciones2[index]?.connectorLabel)}</TableCell>
                  <TableCell align="center">
                      {compararValores(
                        asociaciones1[index]?.connectorLabel,
                        asociaciones2[index]?.connectorLabel
                      )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>administrativeState</TableCell>
                  <TableCell align="center">{safeValue(asociaciones1[index]?.administrativeState)}</TableCell>
                  <TableCell align="center">{safeValue(asociaciones2[index]?.administrativeState)}</TableCell>
                  <TableCell align="center">
                      {compararValores(
                        asociaciones1[index]?.administrativeState,
                        asociaciones2[index]?.administrativeState
                      )}
                  </TableCell>
                </TableRow>
                
                <TableRow >
                  <TableCell>speedAndDuplex</TableCell>
                  <TableCell align="center">{safeValue(asociaciones1[index]?.speedAndDuplex)}</TableCell>
                  <TableCell align="center">{safeValue(asociaciones2[index]?.speedAndDuplex)}</TableCell>
                  <TableCell align="center">
                      {compararValores(
                        asociaciones1[index]?.speedAndDuplex,
                        asociaciones2[index]?.speedAndDuplex
                      )}
                  </TableCell>
                </TableRow>
              
              </React.Fragment>
            ))}
                <TableRow>
                  <TableCell>l2QoSEnabled</TableCell>
                  <TableCell align="center">{JSON.stringify(extraerValores(jsonResults[0], ['l2QoSEnabled']).l2QoSEnabled?.[0])}</TableCell>
                  <TableCell align="center">{JSON.stringify(extraerValores(jsonResults[1], ['l2QoSEnabled']).l2QoSEnabled?.[0])}</TableCell>
                  <TableCell align="center">
                      {compararValores(
                        extraerValores(jsonResults[0], ['l2QoSEnabled']).l2QoSEnabled?.[0],
                        extraerValores(jsonResults[1], ['l2QoSEnabled']).l2QoSEnabled?.[0]
                      )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>l2SwitchingEnabled</TableCell>
                  <TableCell align="center">{JSON.stringify(extraerValores(jsonResults[0], ['l2SwitchingEnabled']).l2SwitchingEnabled?.[0])}</TableCell>
                  <TableCell align="center">{JSON.stringify(extraerValores(jsonResults[1], ['l2SwitchingEnabled']).l2SwitchingEnabled?.[0])}</TableCell>
                  <TableCell align="center">
                      {compararValores(
                        (extraerValores(jsonResults[0], ['l2SwitchingEnabled']).l2SwitchingEnabled?.[0]),
                        (extraerValores(jsonResults[1], ['l2SwitchingEnabled']).l2SwitchingEnabled?.[0])
                      )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>vlanAwarenessEnabled</TableCell>
                  <TableCell align="center">{JSON.stringify(extraerValores(jsonResults[0], ['vlanAwarenessEnabled']).vlanAwarenessEnabled?.[0])}</TableCell>
                  <TableCell align="center">{JSON.stringify(extraerValores(jsonResults[1], ['vlanAwarenessEnabled']).vlanAwarenessEnabled?.[0])}</TableCell>
                  <TableCell align="center">
                      {compararValores(
                        (extraerValores(jsonResults[0], ['vlanAwarenessEnabled']).vlanAwarenessEnabled?.[0]),
                        (extraerValores(jsonResults[1], ['vlanAwarenessEnabled']).vlanAwarenessEnabled?.[0])
                      )}
                  </TableCell>
                </TableRow>
          </TableBody>
          )}
        </Table>
    </ThemeProvider>
    </>
  );
};

export default CargaArchivos;
