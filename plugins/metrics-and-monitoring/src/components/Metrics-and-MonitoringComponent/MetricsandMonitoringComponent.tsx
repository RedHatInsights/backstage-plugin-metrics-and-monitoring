import React, { useState, useEffect } from 'react';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import {
  InfoCard,
  Page,
  Content,
  Link,
  WarningPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

const clusterMap = {
  crcs02ue1: {
    url: `https://prometheus.crcs02ue1.devshift.net`,
    name: 'stage',
    datasource: 'PDD8BE47D10408F45',
  },
  crcp01ue1: {
    url: `https://prometheus.crcp01ue1.devshift.net`,
    name: 'prod',
    datasource: 'PC1EAC84DCBBF0697',
  },
};

export function MetricsandMonitoringComponent() {
  const { entity } = useEntity();
  const grafanaUrl =
    entity.metadata.annotations?.[
      'metrics-and-monitoring/grafana-dashboard-url'
    ];
  const catchpointUrl =
    entity.metadata.annotations?.['metrics-and-monitoring/catchpoint-test-id'];
  const [currentEnvironment, setCurrentEnvironment] = useState<string>('');
  const [currentEnvironmentUrl, setCurrentEnvironmentUrl] =
    useState<string>('');
  const [currentEnvironmentDatasource, setCurrentEnvironmentDatasource] =
    useState<string>('');

  const getClusterUrl = (cluster: string) => {
    if (clusterMap[cluster as keyof typeof clusterMap]) {
      return clusterMap[cluster as keyof typeof clusterMap].url;
    }
    return cluster;
  };

  const getClusterName = (cluster: string) => {
    if (clusterMap[cluster as keyof typeof clusterMap]) {
      return clusterMap[cluster as keyof typeof clusterMap].name;
    }
    return cluster;
  };

  const getClusterDatasource = (cluster: string) => {
    if (clusterMap[cluster as keyof typeof clusterMap]) {
      return clusterMap[cluster as keyof typeof clusterMap].datasource;
    }
    return cluster;
  };

  const ClusterSelect = () => {
    return (
      <FormControl>
        <InputLabel id="cluster-select-label">Cluster</InputLabel>
        <Select
          labelId="cluster-select-label"
          id="cluster-select"
          value={currentEnvironment}
          onChange={e => {
            setCurrentEnvironmentDatasource(e.target.value === 'stage' ? getClusterDatasource('crcs02ue1') : getClusterDatasource('crcp01ue1'),);
            setCurrentEnvironment(e.target.value as string);
            setCurrentEnvironmentUrl(
              e.target.value === 'stage'
                ? getClusterUrl('crcs02ue1')
                : getClusterUrl('crcp01ue1'),
            );
          }}
        >
          <MenuItem value={'stage'}>Stage</MenuItem>
          <MenuItem value={'prod'}>Prod</MenuItem>
        </Select>
      </FormControl>
    );
  };

  useEffect(() => {
    const currentClusterName = getClusterName('crcs02ue1');
    const currentClusterUrl = getClusterUrl('crcs02ue1');
    const currentClusterDatasource = getClusterDatasource('crcs02ue1');
    setCurrentEnvironment(currentClusterName);
    setCurrentEnvironmentUrl(currentClusterUrl);
    setCurrentEnvironmentDatasource(currentClusterDatasource);
  }, []);

  const GrafanaGridItem = () => {
    if (!grafanaUrl) {
      return (
        <WarningPanel title="Grafana Dashboard URL missing">
          Would you like your grafana dashboard link here? Add the
          metrics-and-monitoring/grafana-dashboard-url: &lt;url&gt; label to
          your app.yml in app-interface
        </WarningPanel>
      );
    }
    return (
      <InfoCard title="Grafana">
        <Typography variant="body1">
          <Link
            target="_blank"
            to={`${grafanaUrl}&var-datasource=${currentEnvironmentDatasource}`}
          >
            {' '}
            Grafana dashboard
          </Link>
        </Typography>
      </InfoCard>
    );
  };

  const CatchpointItem = () => {
    if (!catchpointUrl) {
      return (
        <WarningPanel title="Catchpoint test missing">
          <Typography variant="body1">
            Would you like your Catchpoint test link to show up here? Add the
            metrics-and-monitoring/catchpoint-test-id: &lt;id&gt; label to your
            app.yml in app-interface.
            <br />
            You can find it at{' '}
            <Link
              to="https://portal.catchpoint.com/ui/Symphony/ControlCenter/Tests/Folder/43294"
              target="_blank"
            >
              https://portal.catchpoint.com/ui/Symphony/ControlCenter/Tests/Folder/43294
            </Link>
            <br />
            (after you log in with RedHat SSO and not checking the "remember me"
            option).
          </Typography>
        </WarningPanel>
      );
    }
    return (
      <InfoCard title="Catchpoint test">
        <Typography variant="body1">
          <Link
            target="_blank"
            to={`https://portal.catchpoint.com/ui/Symphony/ControlCenter/Tests/Test/${catchpointUrl}/Properties`}
          >
            {' '}
            Catchpoint test
          </Link>
        </Typography>
      </InfoCard>
    );
  };

  return (
    <Page themeId="tool">
      <Content>
        <Grid container direction="row">
          <Grid item xs={11}>
            Metrics and Monitoring
          </Grid>
          <Grid item xs={1}>
            <ClusterSelect />
          </Grid>
        </Grid>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <GrafanaGridItem />
          </Grid>
          <Grid item>
            <InfoCard title="Prometheus">
              <Typography variant="body1">
                <Link
                  target="_blank"
                  to={`${currentEnvironmentUrl}/alerts?search=${entity.metadata.title}`}
                >
                  {' '}
                  Prometheus Alerts{' '}
                </Link>
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item>
            <CatchpointItem />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
