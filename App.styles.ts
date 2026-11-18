import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17251F",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  logoIcon: {
    width: 32,
    height: 32,
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F5D99A",
    letterSpacing: 3,
  },
  subtitle: {
    color: "#A9B9A8",
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 25,
  },
  stat: {
    backgroundColor: "#263A30",
    padding: 12,
    borderRadius: 12,
    width: "29%",
    alignItems: "center",
  },
  statLabel: {
    color: "#A9B9A8",
    fontSize: 10,
  },
  statValue: {
    color: "#F5D99A",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  board: {
    width: "100%",
    maxWidth: 360,
    aspectRatio: 9 / 6,
    backgroundColor: "#263A30",
    padding: 5,
    borderRadius: 12,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    margin: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  wall: {
    backgroundColor: "#55745A",
    borderWidth: 1,
    borderColor: "#78936C",
  },
  floor: {
    backgroundColor: "#D7C49B",
  },
  target: {
    backgroundColor: "#E5B96C",
  },
  box: {
    backgroundColor: "#A76B3F",
    borderWidth: 2,
    borderColor: "#704326",
  },
  playerIcon: {
    width: 23,
    height: 23,
  },
  boxIcon: {
    width: 21,
    height: 21,
  },
  targetIcon: {
    width: 15,
    height: 15,
  },
  instruction: {
    color: "#D8E4D4",
    marginTop: 25,
    fontSize: 14,
  },
  controls: {
    alignItems: "center",
    marginTop: 20,
  },
  middleControls: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },
  arrow: {
    width: 65,
    height: 55,
    borderRadius: 14,
    backgroundColor: "#D9A85F",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    width: 30,
    height: 30,
  },
  arrowLeft: {
    transform: [{ rotate: "270deg" }],
  },
  arrowDown: {
    transform: [{ rotate: "180deg" }],
  },
  arrowRight: {
    transform: [{ rotate: "90deg" }],
  },
  actions: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#314A3B",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  restartButton: {
    paddingHorizontal: 12,
  },
  actionText: {
    color: "#F5D99A",
    fontWeight: "bold",
  },
  editorButton: {
    backgroundColor: "#263A30",
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  editorButtonText: {
    color: "#F5D99A",
    fontSize: 14,
    fontWeight: "bold",
  },
  disabledEditorButton: {
    opacity: 0.45,
  },
  storageError: {
    color: "#F2A18F",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  win: {
    alignItems: "center",
    marginTop: 20,
  },
  winHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  winIcon: {
    width: 22,
    height: 22,
  },
  winText: {
    color: "#F5D99A",
    fontSize: 18,
    fontWeight: "bold",
  },
  nextLevelButton: {
    backgroundColor: "#D9A85F",
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  nextLevelText: {
    color: "#263A30",
    fontWeight: "bold",
  },
});
