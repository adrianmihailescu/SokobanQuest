import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17251F",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  logo: {
    fontSize: 32,
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
  player: {
    fontSize: 23,
  },
  boxEmoji: {
    fontSize: 21,
  },
  targetEmoji: {
    fontSize: 15,
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
  arrowText: {
    color: "#263A30",
    fontSize: 25,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#314A3B",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  actionText: {
    color: "#F5D99A",
    fontWeight: "bold",
  },
  win: {
    alignItems: "center",
    marginTop: 20,
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
