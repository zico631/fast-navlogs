// Station list for the winds aloft dropdown.
// The NWS discontinued the FB winds aloft text tables on Nov 3, 2026 (NAM retirement),
// so the list can no longer be read from the table. These are the same FB stations
// (NWSI 10-812, Appendix A), grouped by the dropdown's regions.

const REGIONS = {
  bos: "ACK ACY AGC ALB AVP BDL BGR BML BOS BUF CAR CRW EKN EMI JFK ORF PLB PSB PWM RIC ROA SYR",
  mia: "ATL BHM BNA CAE CHS CSG EYW FLO GSP HAT HSV ILM JAN JAX LOU MEM MGM MIA MLB MOB PFN PIE RDU SAV TLH TRI TYS",
  chi: "ABR AXN BFF BRL CGI CLE CMH COU CVG DBQ DIK DLH DSM ECK EVV FSD FWA GCK GFK GLD GRB GRI ICT IND INL JOT LSE MCW MKC MKG MOT MQT MSP OMA ONL PIR RAP SGF SLN SPI SSM STL TVC",
  dfw: "ABI ABQ AMA BRO CLL CRP DAL DRT ELP FMN FSM GAG HOU INK LBB LCH LIT LRD MRF MSY OKC PSX ROW SAT SHV SPS TCC TUL ZUN",
  slc: "ALS BAM BCE BIL BOI CZI DEN DLN ELY GGW GJT GPI GTF LAS LND LWS MBW MLS PHX PIH PRC PUB RKS RNO SLC TUS",
  sfo: "AST BIH BLH FAT FOT GEG IMB LKV ONT OTH PDX RBL RDM SAC SAN SBA SEA SFO SIY WJF YKM",
  alaska: "ADK ADQ AFM AKN ANC ANN BET BRW BTI BTT CDB CZF EHM FAI FYU GAL GKN HOM IKO JNU LUR MCG MDO OME ORT OTZ SNP TKA UNK YAK",
  hawaii: "HNL ITO KOA LIH LNY OGG",
  other_pac: "AWK GRO GSN GUM JON KWA MAJ MDY PNI PPG ROR TKK TNI TTK",
};

export default async function handler(req, res) {
  try {
    const region = String(req.query.region || "bos").toLowerCase();

    let ids;
    if (region === "us" || region === "all") {
      ids = Object.values(REGIONS).join(" ").split(" ");
    } else if (REGIONS[region]) {
      ids = REGIONS[region].split(" ");
    } else {
      res.status(400).json({ error: `Unknown region: ${region}` });
      return;
    }

    const stations = Array.from(new Set(ids)).sort();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, s-maxage=86400");
    res.status(200).json({ stations });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
