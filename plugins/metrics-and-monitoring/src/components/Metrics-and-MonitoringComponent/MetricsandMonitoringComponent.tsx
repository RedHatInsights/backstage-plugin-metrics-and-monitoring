import React, { useState, useEffect } from 'react';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TablePagination,
} from '@material-ui/core';
import { InfoCard, Page, Content, Link } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

// Cluster configuration
const clusterMap = {
  stage: {
    proxy: `prometheus/stage`,
    url: `https://prometheus.crcs02ue1.devshift.net`,
    name: 'Stage',
    kibana: `https://kibana.apps.crcs02ue1.urby.p1.openshiftapps.com/app/kibana#/discover`,
    datasource: 'PDD8BE47D10408F45',
  },
  prod: {
    proxy: `prometheus/prod`,
    url: `https://prometheus.crcp01ue1.devshift.net`,
    name: 'Prod',
    kibana: `https://kibana.apps.crcp01ue1.o9m8.p1.openshiftapps.com/app/kibana#/discover`,
    datasource: 'PC1EAC84DCBBF0697',
  },
};

const getClusterAttribute = (cluster, attribute) => clusterMap[cluster]?.[attribute] || '';

export function MetricsAndMonitoringComponent() {
  const { entity } = useEntity();
  const grafanaUrl = entity.metadata.annotations?.['metrics-and-monitoring/grafana-dashboard-url'];
  const catchpointUrl = entity.metadata.annotations?.['metrics-and-monitoring/catchpoint-test-id'];
  const [currentCluster, setCurrentCluster] = useState('stage');
  const [prometheusData, setPrometheusData] = useState([]);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;

  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');

  const fetchAlerts = (proxy) => {
    fetch(
      `${backendUrl}/api/proxy/${proxy}/query?query=ALERTS%7Balertstate%3D%22firing%22%2C%20app_team%3D%22${entity.metadata.title}%22%7D`
    )
      .then((response) => response.json())
      .then((response) => {
        setPrometheusData(response.data?.result || []);
      })
      .catch((error) => {
        setError(true);
        console.error(`Error fetching data: ${error}`);
      });
  };

  useEffect(() => {
    fetchAlerts(getClusterAttribute(currentCluster, 'proxy'));
  }, [currentCluster]);

  const handleClusterChange = (event) => {
    const selectedCluster = event.target.value;
    setCurrentCluster(selectedCluster);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };


  const colorizeAlert = (severity) => {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
    };
  }

  const AlertsTable = () => {
    if (prometheusData.length === 0) {
      return (
        <InfoCard title="Firing Alerts">
          <Typography variant="body1" align="center">
            No Active Alerts
          </Typography>
        </InfoCard>
      );
    }

    if (error) {
      return (
        <InfoCard title="Error">
          <Typography variant="body1" align="center" color="error">
            Something went wrong while fetching alerts data. Please try again later.
          </Typography>
        </InfoCard>
      );
    }
    
    return (
      <InfoCard title="Firing Alerts">
        <TableContainer component={Paper}>
          <Table size="small" aria-label="alerts">
            <TableHead>
              <TableRow>
                <TableCell>Alert Name</TableCell>
                <TableCell width={100}>Severity</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>NameSpace</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prometheusData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((alert, index) => (
                  <TableRow key={index}>
                    <TableCell>{alert.metric.alertname}</TableCell>
                    <TableCell style={{color: colorizeAlert(alert.metric.severity)}}>{alert.metric.severity}</TableCell>
                    <TableCell>{new Date(alert.value[0] * 1000).toLocaleString()}</TableCell>
                    <TableCell>{alert.metric.namespace}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={prometheusData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[25]}
          />
        </TableContainer>
      </InfoCard>
    );
  };
  
  const ClusterSelect = () => (
    <FormControl>
      <InputLabel id="cluster-select-label">Cluster</InputLabel>
      <Select labelId="cluster-select-label" id="cluster-select" value={currentCluster} onChange={handleClusterChange}>
        {Object.keys(clusterMap).map((key) => (
          <MenuItem key={key} value={key}>
            {clusterMap[key].name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Page themeId="tool">
      <Content>
        <Grid container spacing={5}>
          <Grid item xs={11}>
            <Typography variant="h6">Metrics and Monitoring</Typography>
          </Grid>
          <Grid item xs={1}>
            <ClusterSelect />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          {grafanaUrl && (
            <Grid item xs={3}>
              <InfoCard title="Grafana">
                <Typography variant="body1">
                  <Link target="_blank" to={`${grafanaUrl}&var-datasource=${getClusterAttribute(currentCluster, 'datasource')}`}>
                    Grafana Dashboard
                  </Link>
                </Typography>
              </InfoCard>
            </Grid>
          )}
          <Grid item xs={3}>
            <InfoCard title="Prometheus">
              <Typography variant="body1">
                <Link
                  target="_blank"
                  to={`${getClusterAttribute(currentCluster, 'url')}/graph?g0.expr=ALERTS%7Balertstate%3D%22firing%22%2C%20app_team%3D%22${entity.metadata.title}%22%7D&g0.tab=1&g0.display_mode=lines&g0.show_exemplars=0&g0.range_input=1h`}
                >
                  Prometheus Alerts
                </Link>
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={3}>
            <InfoCard title="Kibana">
              <Typography variant="body1">
                <Link target="_blank" to={getClusterAttribute(currentCluster, 'kibana')}>
                  Kibana Logging
                </Link>
              </Typography>
            </InfoCard>
          </Grid>
          {catchpointUrl && (
            <Grid item xs={3}>
              <InfoCard title="Catchpoint Test">
                <Typography variant="body1">
                  <Link target="_blank" to={`https://portal.catchpoint.com/ui/Symphony/ControlCenter/Tests/Test/${catchpointUrl}/Properties`}>
                    Catchpoint Test
                  </Link>
                </Typography>
              </InfoCard>
            </Grid>
          )}
          <Grid item xs={12}>
            <AlertsTable />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
